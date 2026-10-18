# Frontend Compatibility Specification (Homico Backend)

This document maps every API call made by the frontend, verified against the actual frontend source code (`src/api/*`, `src/context/AuthContext.jsx`, `src/features/*`, and `src/pages/*`).

## 1. Verified Frontend API Calls

| Frontend Caller | Function | HTTP Method & Path | Request Shape | Expected Response Fields Consumed | Verification Status |
|---|---|---|---|---|---|
| `src/context/AuthContext.jsx` (L37) | `authApi.register` | `POST /auth/register/` | `{ email, username, full_name, phone, password }` | Response body is ignored by frontend (immediately logs in via `login()`). | Verified by Contract & Auth tests |
| `src/context/AuthContext.jsx` (L29) | `authApi.login` | `POST /auth/login/` | `{ email, password }` | `{ access, refresh }` | Verified by Contract & Auth tests |
| `src/context/AuthContext.jsx` (L22, L31) | `authApi.me` | `GET /auth/me/` | None (Bearer header) | User object directly consumed: `full_name`, `email`, `role`, `id` | Verified by Contract & Auth tests |
| `src/api/client.js` (L50) | Axios refresh interceptor | `POST /auth/refresh/` | `{ refresh }` | `{ access }` (Note: old refresh token is kept: `setTokens({ access: data.access, refresh })`) | Verified by Contract & Auth tests |
| `src/pages/ServicesPage.jsx` (L8) | `servicesApi.listCategories` | `GET /services/categories/` | None (Public) | Array of categories: each category has `id`, `name`, `description`, and `items[]`. Each item has `id`, `title`, `is_hourly`, `hourly_rate`, `inspection_fee`. | Verified by Contract & Services tests |
| `src/features/bookings/BookingForm.jsx` (L33) | `bookingsApi.create` | `POST /bookings/services/` | `{ full_name, phone, address, city, pincode, scheduled_date, time_slot, problem, service, estimated_price }` | Created booking object | Verified by Contract & Bookings tests |
| `src/pages/DashboardPage.jsx` (L9) | `bookingsApi.list` | `GET /bookings/services/` | None (Bearer header) | Array or `{ results: [] }` of bookings: each has `id`, `service` (populated with `title`), `status`, `scheduled_date`, `time_slot`, `address`, `estimated_price` | Verified by Contract & Bookings tests |
| `src/pages/MaterialsPage.jsx` (L7) | `materialsApi.list` | `GET /materials/` | None (Public) | Array or `{ results: [] }` of materials: each has `id`, `name`, `category` (string), `price`, `unit` | Verified by Contract & Materials tests |

## 2. Defined in Frontend API Layer but Not Yet Used by UI Components

| Frontend Caller | Function | HTTP Method & Path | Notes |
|---|---|---|---|
| `src/api/services.js` (L5) | `servicesApi.getCategory` | `GET /services/categories/:slug/` | Returns single category with items |
| `src/api/services.js` (L6) | `servicesApi.listItems` | `GET /services/items/` | Supports query params (`category`, `search`, `is_hourly`) |
| `src/api/vendors.js` (L4) | `vendorsApi.list` | `GET /vendors/` | Supports query params (`category`, `city`, etc.) |
| `src/api/vendors.js` (L5) | `vendorsApi.get` | `GET /vendors/:id/` | Returns single vendor details |
| `src/api/bookings.js` (L6) | `bookingsApi.get` | `GET /bookings/services/:id/` | Returns single booking detail with quotations |
| `src/api/bookings.js` (L7) | `bookingsApi.decideQuotation` | `PATCH /bookings/quotations/:id/` | Body: `{ status: "accepted" | "rejected" }` |
| `src/api/materials.js` (L5) | `materialsApi.createOrder` | `POST /materials/orders/` | Creates material order |
| `src/api/materials.js` (L6) | `materialsApi.listOrders` | `GET /materials/orders/` | Lists user material orders |

## 3. Strict Compatibility Rules (C1 - C13)

1. **C1 (No envelope)**: Responses must be raw JSON (resource object or array of resources). Never wrap in `{ "success": true, "data": ... }`.
2. **C2 (Error format & key order)**: Error body format is `{ ...fieldErrors, "success": false, "detail": "<summary>", "message": "<summary>" }`. Field-error keys are serialized FIRST so `RegisterForm.jsx`'s `Object.values(data || {})[0]?.[0]` accesses the field error string array directly. For general errors with no field errors, `"success": false` comes first.
3. **C3 (Naming convention)**: Strict `snake_case` on all fields (`full_name`, `is_hourly`, `hourly_rate`, `inspection_fee`, `scheduled_date`, `time_slot`, `estimated_price`, `created_at`, `updated_at`). Mongoose schema timestamps configured as `{ createdAt: "created_at", updatedAt: "updated_at" }`.
4. **C4 (Serialization)**: Every document serializes with `id` (string), and removes `_id`, `__v`, and `password_hash` through a global Mongoose `toJSON` plugin.
5. **C5 (Trailing slashes)**: Every endpoint supports both `/path` and `/path/` with Express `strict routing` disabled by default.
6. **C6 (Port & CORS)**: Port 8000, prefix `/api`. CORS allows `CLIENT_ORIGIN` (`http://localhost:5173`), with credentials and methods `GET,POST,PATCH,PUT,DELETE,OPTIONS`.
7. **C7 (401 vs 403)**: Missing/invalid/expired token returns `401 Unauthorized` (triggers frontend refresh interceptor). Authenticated but forbidden returns `403 Forbidden`.
8. **C8 (Public endpoints)**: Public endpoints (`/services/*`, `/materials`) must not read `Authorization` header so stale tokens don't block unauthenticated browsing.
9. **C9 (List responses)**: Plain array by default (capped at 200). If `page` or `limit` is provided, return `{ count, page, limit, results }`.
10. **C10 (Two-query nesting)**: `GET /services/categories/` builds category items using 2 queries (categories, then items with `$in`), avoiding N+1.
11. **C11 (Constant-time login response)**: Login failure returns `401 { detail: "Invalid credentials" }` and executes a dummy bcrypt comparison when user is not found to mitigate timing attacks.
12. **C12 (Registration handling)**: `201 Created` with `{ access, refresh, user }`. Duplicate email/username returns `409` with field-keyed array. `role` in body is stripped (always `customer`).
13. **C13 (Token refresh policy)**: `POST /auth/refresh/` accepts `{ refresh }` and returns `{ access }` only. No token rotation is used because the frontend keeps the original refresh token.

## 4. Edge Cases Identified & Handled

- **No Refresh Rotation**: In `src/api/client.js`, line 51 does `setTokens({ access: data.access, refresh })`. If backend returned a new refresh token or invalidated the old one, frontend would retain the old one and subsequent refreshes would fail. Refresh rotation is therefore deliberately disabled.
- **Register Error Display**: In `RegisterForm.jsx`: `setError(typeof data === "string" ? data : Object.values(data || {})[0]?.[0] || "Registration failed")`. If `success: false` were the first key, `Object.values` would return `[false, ...]`, whose `[0]` index would yield `undefined` or fail. Placing field errors first (e.g. `{ email: ["Email already in use"] }`) ensures `Object.values(data)[0]` is `["Email already in use"]` and `[0]` accesses the string.
- **Client Estimated Price Untrusted**: `BookingForm.jsx` sends client-calculated `estimated_price`. The backend recalculates `estimated_price` server-side from the active `ServiceItem` (`is_hourly ? hourly_rate : inspection_fee`).

## 5. Suggested Frontend Improvements (Not Made, Frontend is Read-Only)

1. **Route Code Splitting**: `src/App.jsx` statically imports all pages. Use `React.lazy()` and `Suspense` for faster initial bundle loading.
2. **Role-Based Dashboards**: Current `DashboardPage.jsx` only supports viewing customer bookings. Add vendor queue and admin dashboard components.
3. **Quotation Interaction UI**: The frontend defines `bookingsApi.decideQuotation()` but has no UI buttons on `DashboardPage.jsx` to view quotation details or accept/reject them.
4. **Materials Ordering Flow**: `materialsApi.createOrder()` and `listOrders()` are defined, but `MaterialsPage.jsx` only shows a read-only catalog with no cart or checkout.
5. **Refresh Rotation Support**: Update `src/api/client.js` line 51 to `setTokens({ access: data.access, refresh: data.refresh || refresh })` so the backend can safely implement refresh token rotation.

