# Homico Backend: Comprehensive Technical Interview Guide

> This guide is grounded strictly in the actual code running in `backend/`. Every feature, architectural choice, data model, security safeguard, index, and trade-off documented here corresponds to real files and implementation patterns.

---

## 1. Feature Walkthroughs

### 1.1 Authentication & Session Management
- **Problem Solved**: Secure customer registration, stateless token-based authorization, token refresh without race conditions or client desynchronization, and defense against timing/enumeration attacks.
- **Request Flow**:
  - `POST /api/auth/register`: `authLimiter` -> `validate({ body: registerSchema })` -> `authController.register` -> `User.create` -> `token.generateTokens` -> `201 { access, refresh, user }`. Public registration strips any `role` payload and enforces `customer`.
  - `POST /api/auth/login`: `authLimiter` -> `validate({ body: loginSchema })` -> `authController.login` -> `User.findOne({ email }).select("+password_hash")`. If user not found, executes `bcrypt.compare(password, DUMMY_HASH)` to preserve timing equivalence -> `200 { access, refresh, user }`.
  - `POST /api/auth/refresh`: `refreshLimiter` -> `validate({ body: refreshSchema })` -> `authController.refresh` -> `token.verifyRefreshToken` -> `User.findById` (checks `is_active`) -> `token.generateTokens` -> `200 { access }`. (No token rotation, keeping frontend sync intact).
  - `GET /api/auth/me`: `authenticate` -> `authController.me` -> returns authenticated user profile stripped of sensitive hash.
- **Models Involved**: `User` (`src/models/User.js`).
- **Middleware Involved**: `rateLimiters.js` (`authLimiter`, `refreshLimiter`), `validationMiddleware.js` (`validate`), `authMiddleware.js` (`authenticate`).
- **Security Considerations**: Timing attack mitigation via dummy bcrypt compare (Rule C11); separate secrets for access and refresh tokens; algorithm pinned to HS256; password hash excluded by default (`select: false`).
- **Trade-offs**: Single DB lookup on each authenticated request (`authenticate` reloads role/is_active) to ensure immediate revocation, rather than relying solely on JWT claims.

---

### 1.2 Role-Based Access Control (RBAC) & IDOR Protection
- **Problem Solved**: Enforcing least-privilege access across `customer`, `vendor`, and `admin` roles, and eliminating Insecure Direct Object References (IDOR).
- **Request Flow**:
  - Routes mount `authenticate`, followed by `requireRole(...allowedRoles)`, and for vendor routes `loadVendorProfile`.
  - In controllers (`bookingController.js`, `orderController.js`, `projectController.js`), ownership is enforced inside the database query itself:
    - Customer query: `Booking.findOne({ _id: req.params.id, user: req.user.id })`
    - Vendor query: `Booking.findOne({ _id: req.params.id, vendor: req.vendorProfile._id })`
    - Admin query: `Booking.findOne({ _id: req.params.id })`
  - If a customer queries another customer's resource, MongoDB returns `null` and the controller raises `ApiError(404, "Not found")`.
- **Models Involved**: `User`, `Vendor`, `Booking`, `MaterialOrder`, `Project`.
- **Middleware Involved**: `authenticate`, `requireRole`, `loadVendorProfile`.
- **Security Considerations**: Query-level isolation ensures no unowned record is ever fetched into memory. An attacker guessing IDs receives `404 Not Found` rather than `403 Forbidden`, preventing resource enumeration.
- **Trade-offs**: Admins bypass ownership filters for supervisory workflows; vendor profile lookup is cached per-request on `req.vendorProfile`.

---

### 1.3 Service Catalog & N+1 Prevention
- **Problem Solved**: High-performance public browsing of home service categories and their associated inspection packages without N+1 query storms.
- **Request Flow**:
  - `GET /api/services/categories`: Public (Rule C8: does not read `Authorization`) -> `serviceController.listCategories`.
  - Query 1: `ServiceCategory.find({ is_active: true }).sort({ name: 1 })`.
  - Query 2: `ServiceItem.find({ category: { $in: categoryIds }, is_active: true })`.
  - In-memory aggregation groups items by category ID and nests them as `category.items`.
- **Models Involved**: `ServiceCategory` (`src/models/ServiceCategory.js`), `ServiceItem` (`src/models/ServiceItem.js`).
- **Middleware Involved**: Public cache header middleware (`Cache-Control: public, max-age=60`).
- **Security Considerations**: Read-only public access; soft delete flag (`is_active: false`) prevents orphaned booking foreign keys.
- **Trade-offs**: Exactly 2 DB queries regardless of whether there are 5 or 50 categories. In-memory grouping overhead is minimal (sub-millisecond for typical catalog sizes).

---

### 1.4 Vendor Management & Directory Filtering
- **Problem Solved**: Directory of verified vendors for customer discovery and admin assignment, protecting vendor privacy.
- **Request Flow**:
  - `GET /api/vendors`: `authenticate` -> `vendorController.listVendors`.
  - If caller is not admin, query automatically injects `is_verified: true`.
  - Sensitive contact fields (`email`, `phone`) are stripped by `sanitizeVendorForUser()` unless the caller is an admin or the owning vendor.
- **Models Involved**: `Vendor` (`src/models/Vendor.js`), `ServiceCategory`.
- **Middleware Involved**: `authenticate`.
- **Security Considerations**: Contact data privacy masking; unverified vendors completely hidden from public/customer queries.
- **Trade-offs**: Compound index on `{ is_verified: 1, city: 1 }` enables zero-doc scanning for unindexed cities or unverified profiles.

---

### 1.5 Bookings State Machine & Price Integrity
- **Problem Solved**: Booking home service inspections without trusting client price calculations, and enforcing rigid lifecycle state transitions.
- **Request Flow**:
  - `POST /api/bookings/services`: `authenticate` -> `requireRole("customer")` -> `validate({ body: createBookingSchema })` -> `bookingController.createBooking` -> `bookingWorkflow.createBookingService`.
  - Server ignores any client-supplied `estimated_price` and computes it from DB: `service.is_hourly ? service.hourly_rate : service.inspection_fee`.
  - Status initialized to `pending`.
  - Status updates (`PATCH /api/bookings/services/:id`): Validated against `BOOKING_TRANSITIONS` map in `src/utils/transitions.js`. Customers can only cancel from `pending`, `confirmed`, or `vendor_assigned`. Vendors transition `vendor_assigned -> inspection_completed`, `quotation_accepted -> work_in_progress`, `work_in_progress -> completed`.
- **Models Involved**: `Booking` (`src/models/Booking.js`), `ServiceItem`, `Vendor`, `Project`.
- **Middleware Involved**: `authenticate`, `requireRole`, `validate`, `validateObjectId`.
- **Security Considerations**: Zero trust on client pricing; transition whitelist prevents skipping inspections or jumping to completed.
- **Trade-offs**: State machine decoupled into pure utility functions (`transitions.js`) making it 100% unit-testable without database dependencies.

---

### 1.6 Quotations Lifecycle & Lazy Expiry
- **Problem Solved**: Managing multi-step contractor quotes (labor + materials), preventing simultaneous duplicate quotes, and expiring stale quotes without heavy background cron jobs.
- **Request Flow**:
  - `POST /api/bookings/services/:id/quotations`: Assigned vendor or admin creates a `draft` quote (`labor_cost + material_cost = total_amount` computed by Mongoose pre-validate hook). Checked: booking has vendor, is in `inspection_completed|quotation_rejected|quotation_sent`, and no live quote exists.
  - `PATCH /api/bookings/quotations/:id`:
    - Vendor sends quote (`status: "sent"`, `valid_days: 7`). Sets `valid_until = now + days`, and moves booking to `quotation_sent`.
    - Customer accepts/rejects (`PATCH { status: "accepted" | "rejected" }`).
  - **Lazy Expiry**: `checkLazyExpiry()` evaluates `valid_until < now`. If expired, sets status to `expired` and returns `409 Quotation has expired`.
  - **Race Safety**: Customer decision uses conditional atomic update: `Quotation.findOneAndUpdate({ _id, status: "sent" }, { status })`.
- **Models Involved**: `Quotation` (`src/models/Quotation.js`), `Booking`.
- **Middleware Involved**: `authenticate`, `loadVendorProfile`, `requireRole`.
- **Security Considerations**: Customers cannot see drafts (`status !== 'draft'` filter); double-click acceptance prevention via atomic match on `status: "sent"`.
- **Trade-offs**: Lazy evaluation removes the operational complexity of cron jobs or Redis timers for a student portfolio, while guaranteeing consistency at the exact moment of decision.

---

### 1.7 Material Orders & Atomic Stock Rollback
- **Problem Solved**: Purchasing raw construction materials with guaranteed stock consistency, snapshot pricing, and multi-item rollback on partial oversell.
- **Request Flow**:
  - `POST /api/materials/orders`: `authenticate` -> `requireRole("customer")` -> `validate({ body: createOrderSchema })` -> `orderService.createOrderService`.
  - Deduplicates items by summing quantities.
  - Loads all materials in one `$in` query. Prices taken strictly from DB.
  - Iterates through items executing atomic decrement: `Material.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`.
  - If any item has insufficient stock (`modifiedCount === 0`), sequentially rolls back all already-decremented lines using `$inc: { stock: qty }` and returns `409 Insufficient stock`.
  - Order snapshot captures `unit_price`, `name`, `unit`, and denormalized `vendor`.
  - Cancellation (customer from `pending`, admin from `pending|confirmed|processing`) restores stock via `$inc`.
- **Models Involved**: `MaterialOrder` (`src/models/MaterialOrder.js`), `Material` (`src/models/Material.js`), `Project`.
- **Middleware Involved**: `authenticate`, `requireRole`, `validate`.
- **Security Considerations**: Client price tampering impossible; stock oversell prevented at MongoDB driver level.
- **Trade-offs**: Implemented sequential compensation rollback instead of MongoDB multi-document transactions to allow running on standalone MongoDB instances without a replica set.

---

### 1.8 Construction Projects & Cross-Resource Aggregation
- **Problem Solved**: Multi-trade construction project tracking linking bookings and material orders under an overarching budget and timeline.
- **Request Flow**:
  - `POST /api/projects`: Customer creates project with date validation (`estimated_end_date >= start_date`) and budget.
  - `GET /api/projects/:id`: Returns project detail plus lightweight linked documents: `Booking.find({ project: id })` and `MaterialOrder.find({ project: id })`.
- **Models Involved**: `Project` (`src/models/Project.js`), `Booking`, `MaterialOrder`.
- **Middleware Involved**: `authenticate`, `validateObjectId`, `validate`.
- **Security Considerations**: Customers only access projects they own; foreign references validated on booking/order creation.
- **Trade-offs**: Lightweight population keeps response payload concise while proving relational integrity in NoSQL.

---

### 1.9 Database Indexing & Query Plan Optimization
- **Problem Solved**: Ensuring sub-millisecond query execution on hot paths and preventing full collection scans (`COLLSCAN`).
- **Implementation**:
  - Compound index `{ user: 1, created_at: -1 }` on `Booking` and `MaterialOrder` satisfies both filter and sorting in a single `FETCH -> IXSCAN` stage.
  - Multikey index `{ "items.vendor": 1, created_at: -1 }` on `MaterialOrder` enables fast vendor order filtering.
  - Directory index `{ is_verified: 1, city: 1 }` on `Vendor`.
  - Verified by `scripts/explainQueries.js` running `explain("executionStats")`.
- **Deliberately Not Indexed**: Text index on service/material names. Catalogs contain tens of items; regex scan takes < 0.1ms. A text index introduces memory and write overhead without prefix matching support.

---

### 1.10 Central Error Handling & Strict Response Shaping
- **Problem Solved**: Conforming strictly to frontend error expectations without crashing the UI or leaking stack traces.
- **Implementation**:
  - `errorMiddleware.js` catches `ApiError`, `ZodError`, Mongoose `ValidationError`, `CastError`, duplicate key `11000`, and JWT errors.
  - Output conforms strictly to Rule C2: `{ ...fieldErrors, "success": false, "detail": "<summary>", "message": "<summary>" }`.
  - Key ordering guarantees `RegisterForm.jsx`'s `Object.values(data)[0]?.[0]` hits the field error string array directly.

---

## 2. Design Decisions & Trade-Offs

1. **Raw JSON Responses vs Envelope**: Responses return raw resource objects or arrays (Rule C1) because the React frontend directly consumes `.then(r => r.data)`.
2. **404 vs 403 on Unowned Resources**: Unowned resources return `404 Not Found` rather than `403 Forbidden` to prevent resource ID enumeration (IDOR mitigation).
3. **Role Loaded from Database**: `authenticate` middleware re-reads `role` and `is_active` from MongoDB on every request, ensuring instant deactivation/demotion without token revocation blocklists.
4. **No Refresh Token Rotation**: Rotation is intentionally disabled because `client.js` keeps the existing refresh token on refresh (`setTokens({ access: data.access, refresh })`).
5. **Lazy Quotation Expiry**: Quotes expire upon read or action rather than requiring a background daemon/cron scheduler.
6. **Compensating Stock Rollback over Transactions**: Atomic `$inc` with compensation rollback allows compatibility with standalone MongoDB instances without replica sets.
7. **Snapshot Pricing on Orders**: Order line items store price, unit, and name at purchase time to ensure financial audit integrity against future catalog changes.
8. **Soft Delete for Catalog Entities**: Categories, service items, and materials use `is_active: false` soft deletion to preserve relational references from historical bookings and orders.
9. **No Text Index for Small Catalogs**: Escaped regex search used over `$text` to support substring matching without the indexing overhead on small collections.
10. **Express 4.x with `asyncHandler`**: Standard Express 4.19 architecture with explicit async error forwarding rather than unreleased/bleeding-edge frameworks.

---

## 3. High-Probability Interview Questions & Answers

#### Q1: How do you prevent Insecure Direct Object References (IDOR) across the application?
> **Answer**: IDOR is prevented at the database query layer rather than through post-fetch conditional checks. In `bookingController.js`, `orderController.js`, and `projectController.js`, customer queries always include `user: req.user.id` or `owner: req.user.id`. For vendors, queries include `vendor: req.vendorProfile._id`. If a user attempts to access an ID belonging to another user, MongoDB returns `null`, and the controller throws `ApiError(404, "Not found")`.

#### Q2: Why return 404 instead of 403 when a customer accesses someone else's booking?
> **Answer**: Returning `403 Forbidden` confirms to an attacker that the resource ID exists. Returning `404 Not Found` keeps existence hidden, preventing ID enumeration.

#### Q3: Why can't we trust `estimated_price` sent from `BookingForm.jsx`?
> **Answer**: The frontend runs in an untrusted client environment where request payloads can be modified via developer tools or scripts. In `bookingWorkflow.js`, the backend ignores `req.body.estimated_price` and looks up the active `ServiceItem` in the database, setting `estimated_price = is_hourly ? hourly_rate : inspection_fee`.

#### Q4: Why use separate secrets for access and refresh tokens?
> **Answer**: If both tokens used the same secret, an attacker with a valid refresh token could present it as an access token, bypassing expiration windows. Separate secrets ensure access and refresh tokens cannot be used interchangeably.

#### Q5: What happens when an access token expires mid-session?
> **Answer**: The backend returns `401 Unauthorized` with `detail: "Token expired"`. The Axios response interceptor in `src/api/client.js` detects the 401, POSTs `{ refresh }` to `/api/auth/refresh/`, receives a new access token, updates `localStorage`, and retries the original request seamlessly.

#### Q6: Why pure JavaScript `bcryptjs` instead of native `bcrypt`?
> **Answer**: Native `bcrypt` requires node-gyp and platform-specific C++ build toolchains (like Visual Studio Build Tools on Windows). `bcryptjs` is pure JavaScript, cross-platform, deterministic, and avoids native compilation errors during deployment.

#### Q7: How do you prevent overselling raw materials when multiple customers place orders simultaneously?
> **Answer**: In `orderService.js`, stock is decremented using an atomic query: `Material.updateOne({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`. MongoDB's document-level lock ensures only requests with sufficient stock modify the document. If `modifiedCount === 0`, stock is insufficient.

#### Q8: What if an order contains 5 items and the 4th item fails stock verification?
> **Answer**: The service catches the failure, iterates through the items that were successfully decremented, and applies compensating additions (`$inc: { stock: +qty }`). No partial order is saved, and a `409` conflict error is returned naming the out-of-stock material.

#### Q9: What happens if two customers attempt to accept/reject a quotation at the same moment?
> **Answer**: In `quotationWorkflow.js`, the update uses `Quotation.findOneAndUpdate({ _id, status: "sent" }, { status })`. Only the first request matches `status: "sent"`. The second request finds no matching document and receives a `409 Conflict`.

#### Q10: Why snapshot `unit_price`, `name`, and `unit` on `MaterialOrder` items?
> **Answer**: Catalog prices change over time. If orders only referenced the `Material` ID, historic orders would recalculate totals using current prices, corrupting invoice history and revenue reports.

#### Q11: Explain the compound index `{ user: 1, created_at: -1 }` on Bookings and its cost.
> **Answer**: This index powers the customer dashboard query (`Booking.find({ user }).sort({ created_at: -1 })`). The B-tree stores documents sorted by user, and within each user, reverse-sorted by date. MongoDB traverses the index directly without an in-memory sort stage (`SORT_KEY_GENERATOR`). The trade-off is index write overhead: every insert or deletion must update the B-tree.

#### Q12: How does mass-assignment protection work in this backend?
> **Answer**: We never pass `req.body` directly to `Model.create()` or `Model.updateOne()`. Every request body is parsed by a strict Zod schema in `validationMiddleware.js`. Zod strips unknown fields, preventing callers from injecting privileged fields like `role: "admin"`, `is_verified: true`, or `status: "completed"`.

#### Q13: How does Zod validation prevent NoSQL operator injection?
> **Answer**: Attackers attempt NoSQL injection by passing objects like `{ "email": { "$ne": null } }`. Because our Zod `loginSchema` defines `email: z.string().email()`, passing an object fails validation immediately with a `400 Bad Request`, never reaching the database.

#### Q14: Why is refresh token rotation disabled?
> **Answer**: The frontend interceptor in `src/api/client.js` executes `setTokens({ access: data.access, refresh })`, explicitly retaining the original refresh token. If the backend rotated the refresh token, the client would retain the invalidated token, failing all future refreshes.

#### Q15: Why is lazy expiry preferred over a background cron job for quotations?
> **Answer**: A cron job requires scheduling infrastructure, handles race conditions between execution ticks, and runs even when no users are active. Lazy expiry evaluates `valid_until < now` at the exact moment the quotation is accessed or decided, ensuring zero-latency enforcement with zero background overhead.

#### Q16: Why not use a MongoDB text index for service and material searches?
> **Answer**: Text indexes in MongoDB do not support substring or prefix matching (e.g. "plumb" for "plumbing"), and require substantial index memory. Because our catalogs contain dozens to hundreds of items, an escaped regex scan (`$regex`) executes in sub-millisecond time.

#### Q17: What does the Mongoose `toJSON` plugin do?
> **Answer**: Defined in `src/models/plugins/toJSON.js`, it transforms all documents during serialization to include a string `id`, while deleting internal MongoDB fields `_id`, `__v`, and sensitive fields like `password_hash`.

#### Q18: Why is dummy bcrypt comparison performed when an unknown email logs in?
> **Answer**: Bcrypt password hashing is intentionally CPU-intensive. If an unknown email returns immediately, it responds in ~2ms, whereas a valid email checking a password takes ~70ms. Attackers measure this timing difference to enumerate valid user emails. Comparing against `DUMMY_HASH` keeps response times uniform.

#### Q19: How are trailing slashes handled across routes?
> **Answer**: Express has `strict routing` disabled by default (`app.set("strict routing", false)`). Both `/api/auth/login` and `/api/auth/login/` resolve to the identical route handler, matching frontend requests.

#### Q20: Explain the two-query category listing in `serviceController.js`.
> **Answer**: A naive approach fetches categories, then loops through each category making a query for its items (N+1 queries). Our implementation executes 1 query for active categories, 1 query for all active items belonging to those categories (`{ category: { $in: categoryIds } }`), and merges them in memory in O(N) time.

#### Q21: What rate limits are enforced, and how do they behave in tests?
> **Answer**: `express-rate-limit` enforces 10 requests / 15 minutes for login/register, 60 requests / 15 minutes for refresh, and 300 requests / 15 minutes globally. In `rateLimiters.js`, the middleware bypasses limits when `NODE_ENV === "test"`, preventing test suite throttling.

#### Q22: What happens if an admin attempts to deactivate their own account?
> **Answer**: In `adminUserController.js`, an explicit guard checks `if (req.user.id === targetId && req.body.is_active === false)`. It throws `ApiError(400, "You cannot deactivate your own admin account")`, preventing platform lockout.

#### Q23: Why do we normalize `scheduled_date` to UTC midnight?
> **Answer**: Date comparison across time zones can cause bookings made late in the evening to appear as yesterday or tomorrow. Normalizing to UTC midnight (`T00:00:00.000Z`) ensures consistent calendar-day matching.

#### Q24: How would you scale this architecture for 100,000 daily bookings?
> **Answer**:
> 1. Deploy MongoDB as a Replica Set with sharding enabled on high-write collections (`Booking`, `MaterialOrder`).
> 2. Implement Redis caching for public catalog endpoints (`/services/*`, `/materials`).
> 3. Move long-running processes (PDF invoice generation, SMS notifications) to a background message queue (e.g., BullMQ / RabbitMQ).
> 4. Run Express across multiple containerized nodes behind an Nginx or AWS ALB reverse proxy.

#### Q25: Why is `validateObjectId` using regex rather than `mongoose.isValidObjectId`?
> **Answer**: `mongoose.isValidObjectId("12charsstring")` returns `true` because MongoDB historically accepted 12-byte raw ASCII strings. Our custom validator checks `/^[a-f\d]{24}$/i`, strictly requiring 24 hexadecimal characters.

#### Q26: Why are error keys ordered with field errors first?
> **Answer**: `RegisterForm.jsx` parses errors using: `Object.values(data || {})[0]?.[0]`. If `success: false` were the first key, `Object.values` would return `[false, ...]`, whose `[0]` index would fail. Putting field errors first ensures `Object.values(data)[0]` returns the array of error messages.

#### Q27: What is the difference between soft deletion and hard deletion in this project?
> **Answer**: `ServiceCategory`, `ServiceItem`, and `Material` use soft deletion (`is_active: false`). Hard deletion (`deleteOne`) would cause foreign key dereferencing failures on existing bookings and material orders. Orders and Bookings cannot be deleted at all; cancellation is a state change.

#### Q28: How does graceful shutdown work in `server.js`?
> **Answer**: When `SIGINT` or `SIGTERM` is received, `server.close()` stops accepting new HTTP connections, existing in-flight requests finish processing, `mongoose.connection.close()` disconnects cleanly, and the process exits. A 10-second watchdog timer ensures the process does not hang indefinitely.

#### Q29: What is the purpose of `scripts/syncIndexes.js`?
> **Answer**: In production, Mongoose `autoIndex` is disabled for performance. `syncIndexes.js` runs `model.syncIndexes()` across all schemas during deployment to create new indexes and drop obsolete ones without restarting application traffic.

#### Q30: What technical debt or limitations remain in the current backend?
> **Answer**:
> 1. Multi-document transactions are not used (to preserve standalone MongoDB compatibility).
> 2. Token revocation relies on database lookup rather than Redis-based token blacklists.
> 3. File uploads (e.g., project site photos, blueprints) are not yet integrated (would use S3/Cloudinary).

---

## 4. Resume Alignment Audit

| Resume Claim | Status | Repository Evidence |
|---|---|---|
| **Full-Stack Home Services & Material Marketplace** | ✅ True | Backend supports booking flows, catalog management, quotation lifecycle, and material orders with inventory tracking. |
| **Role-Based Access Control (RBAC) in Express** | ✅ True | Implemented in `authMiddleware.js`, `roleMiddleware.js`, and scoped database queries across all resources. |
| **End-to-End Construction Project Management** | ⚠️ Partial | Foundational `Project` model, validation, and linking to bookings/orders exist. Milestones and Gantt scheduling are future capabilities. |
| **Distinct Dashboards for Users, Vendors, and Admins** | ❌ Frontend Limitation | Backend provides role-scoped endpoints (`GET /bookings/services`, `GET /materials/orders`). Frontend currently has only a single customer-oriented `DashboardPage.jsx`. |
| **Code Splitting & Lazy Route Loading** | ❌ Frontend Limitation | `App.jsx` statically imports all pages. Documented in `COMPATIBILITY.md` as a recommended frontend optimization. |
| **Mongoose Index Optimization & Execution Plan Analysis** | ✅ True | Compound and multikey indexes verified with `explain("executionStats")` in `scripts/explainQueries.js`. |

---

## 5. Candidate Contribution Guide (For Interview Prep)

> Fill this section with your own personal speaking points during interview preparation:

- **Component I personally designed**: The atomic inventory decrement and sequential compensation rollback mechanism in `src/services/orderService.js`.
- **Challenging bug I debugged**: Identifying that `RegisterForm.jsx` failed to render error strings because JavaScript object serialization was placing `"success": false` ahead of field error keys. Fixed by restructuring `errorMiddleware.js`.
- **Architectural decision I made**: Opting for lazy quotation expiry in `src/services/quotationWorkflow.js` instead of introducing Redis or cron daemons, reducing deployment complexity while guaranteeing transactional consistency.

