# Homico Backend

> Production-style Node.js + Express + MongoDB REST API for the **Homico** home services and construction platform. Companion backend to the Vite/React frontend in this repository.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Authentication Flow](#authentication-flow)
- [Booking & Quotation Workflow](#booking--quotation-workflow)
- [Material Orders & Stock](#material-orders--stock)
- [State Machines](#state-machines)
- [Security](#security)
- [Database Indexes & Performance](#database-indexes--performance)
- [Testing](#testing)
- [Scripts](#scripts)
- [Postman](#postman)
- [Frontend Compatibility](#frontend-compatibility)

---

## Overview

Homico is a home services marketplace where:
- **Customers** book inspections for repairs, AC servicing, plumbing, etc., then accept or reject vendor quotations. They can also order raw construction materials and manage multi-trade construction projects.
- **Vendors** receive booking assignments, conduct inspections, draft and send quotations, and fulfil material orders.
- **Admins** manage the full platform: users, categories, service items, vendor verification, booking assignment, and order pipeline.

---

## Architecture

```
src/
├── config/          # env validation (Zod), MongoDB connection
├── controllers/     # Thin request/response handlers
├── services/        # Business logic workflows (booking, quotation, order)
├── models/          # Mongoose schemas + toJSON plugin
│   └── plugins/
├── routes/          # Express routers with middleware chains
├── middleware/      # auth, role, validation, rate-limiters, error handler
├── validators/      # Zod schemas per resource
└── utils/           # ApiError, asyncHandler, pagination, transitions, token
```

**Design principles**
- Controllers are thin — all business logic lives in `services/`
- State machines guard all status transitions
- Atomic stock decrement with sequential rollback on partial failure
- toJSON plugin globally removes `_id`, `__v`, `password_hash` and adds `id`
- Zod validates and strips all input; no untrusted data reaches Mongoose

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 20 (ESM modules) |
| Framework | Express 4 |
| Database | MongoDB + Mongoose 8 |
| Auth | JWT (access 15 min · refresh 7 days) + bcryptjs |
| Validation | Zod |
| Security | helmet · cors · express-rate-limit |
| Testing | Node.js built-in `node:test` + supertest + mongodb-memory-server |
| Dev | `node --watch` |

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                   # Express app factory
│   ├── server.js                # Entry point + graceful shutdown
│   ├── config/
│   │   ├── db.js
│   │   └── env.js               # Fail-fast Zod env validation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminUserController.js
│   │   ├── serviceController.js
│   │   ├── vendorController.js
│   │   ├── bookingController.js
│   │   ├── quotationController.js
│   │   ├── materialController.js
│   │   ├── orderController.js
│   │   └── projectController.js
│   ├── services/
│   │   ├── bookingWorkflow.js
│   │   ├── quotationWorkflow.js
│   │   └── orderService.js
│   ├── models/
│   │   ├── plugins/toJSON.js
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── ServiceCategory.js
│   │   ├── ServiceItem.js
│   │   ├── Booking.js
│   │   ├── Quotation.js
│   │   ├── Material.js
│   │   ├── MaterialOrder.js
│   │   └── Project.js
│   ├── routes/
│   │   ├── index.js             # Master router
│   │   ├── authRoutes.js
│   │   ├── adminUserRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── vendorRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── materialRoutes.js
│   │   ├── orderRoutes.js
│   │   └── projectRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   ├── rateLimiters.js
│   │   └── errorMiddleware.js
│   ├── validators/
│   │   ├── authValidators.js
│   │   ├── serviceValidators.js
│   │   ├── vendorValidators.js
│   │   ├── bookingValidators.js
│   │   ├── quotationValidators.js
│   │   ├── materialValidators.js
│   │   └── projectValidators.js
│   └── utils/
│       ├── ApiError.js
│       ├── asyncHandler.js
│       ├── escapeRegex.js
│       ├── pagination.js
│       ├── token.js
│       └── transitions.js
├── scripts/
│   ├── seed.js                  # Seed all collections with demo data
│   ├── syncIndexes.js           # Sync Mongoose indexes against live DB
│   └── explainQueries.js        # Explain hot queries (with --bulk flag)
├── tests/
│   ├── setup.js                 # Shared MongoMemoryServer + createApp
│   ├── transitions.test.js      # State machine unit tests
│   ├── contract.test.js         # Frontend compatibility contract tests
│   ├── auth.test.js             # Auth & JWT security tests
│   ├── validation.test.js       # Input validation & injection tests
│   ├── rbac.test.js             # RBAC and IDOR security tests
│   └── workflows.test.js        # End-to-end business logic tests
├── postman/
│   ├── Homico_Backend_API.postman_collection.json
│   └── Homico_Local.postman_environment.json
├── docs/
│   └── COMPATIBILITY.md         # Frontend API compatibility specification
├── .env.example
├── .env                         # Git-ignored
└── package.json
```

---

## Prerequisites

- **Node.js ≥ 20** (ESM support required)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` (service: MongoDB)

Verify:
```powershell
node -v                                          # ≥ 20.x
Test-NetConnection 127.0.0.1 -Port 27017         # TcpTestSucceeded: True
```

---

## Quick Start

```powershell
# 1. Install dependencies
cd backend
npm install

# 2. Configure environment
copy .env.example .env
# Edit .env and set strong JWT secrets (≥ 32 chars, different values)

# 3. Seed database with demo data
node scripts/seed.js

# 4. Start development server
npm run dev
# Server: http://localhost:8000
# Health: http://localhost:8000/api/health
```

---

## Environment Variables

Copy `.env.example` to `.env` and update:

| Variable | Default | Description |
|---|---|---|
| `PORT` | `8000` | HTTP port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/homico` | MongoDB connection string |
| `CLIENT_ORIGIN` | `http://localhost:5173` | CORS allowed origin (comma-separate for multiple) |
| `JWT_ACCESS_SECRET` | *(must set)* | Min 32 chars — access token secret |
| `JWT_REFRESH_SECRET` | *(must set)* | Min 32 chars — must differ from access secret |
| `ACCESS_TOKEN_EXPIRES_IN` | `15m` | Access token TTL |
| `REFRESH_TOKEN_EXPIRES_IN` | `7d` | Refresh token TTL |
| `BCRYPT_ROUNDS` | `12` | bcrypt cost factor |
| `SEED_PASSWORD` | `demo_password_123` | Password for all seeded demo accounts |

> [!CAUTION]
> Never commit `.env` to version control. Use environment variable injection in production.

---

## API Reference

All routes are prefixed with `/api`. Base URL: `http://localhost:8000`

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new customer account |
| POST | `/api/auth/login` | — | Login, get access + refresh tokens |
| POST | `/api/auth/refresh` | — | Exchange refresh token for new access token |
| GET | `/api/auth/me` | ✅ | Get current user profile |

### Services (Public)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/services/categories` | — | List all active categories with nested items |
| GET | `/api/services/categories/:slug` | — | Get single category by slug |
| GET | `/api/services/items` | — | List items with filters: `category`, `search`, `is_hourly` |
| POST | `/api/services/categories` | Admin | Create category |
| PATCH | `/api/services/categories/:id` | Admin | Update category |
| DELETE | `/api/services/categories/:id` | Admin | Soft-delete category |
| POST | `/api/services/items` | Admin | Create service item |
| PATCH | `/api/services/items/:id` | Admin | Update service item |
| DELETE | `/api/services/items/:id` | Admin | Soft-delete service item |

### Bookings

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/bookings/services` | ✅ | List bookings (scoped by role) |
| POST | `/api/bookings/services` | Customer | Create booking |
| GET | `/api/bookings/services/:id` | ✅ | Get booking with quotations |
| PATCH | `/api/bookings/services/:id` | ✅ | Update booking status |
| PATCH | `/api/bookings/services/:id/assign` | Admin | Assign vendor to booking |
| POST | `/api/bookings/services/:id/quotations` | Vendor/Admin | Create draft quotation |
| GET | `/api/bookings/quotations/:id` | ✅ | Get quotation |
| PATCH | `/api/bookings/quotations/:id` | ✅ | Send/accept/reject quotation |

### Materials

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/materials` | — | List active materials (filters: `category`, `search`, `in_stock`) |
| GET | `/api/materials/:id` | — | Get single material |
| POST | `/api/materials` | Vendor/Admin | Create material |
| PATCH | `/api/materials/:id` | Vendor/Admin | Update material |
| DELETE | `/api/materials/:id` | Vendor/Admin | Soft-delete material |

### Material Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/materials/orders` | ✅ | List orders (scoped by role) |
| POST | `/api/materials/orders` | Customer | Create order (atomic stock decrement) |
| GET | `/api/materials/orders/:id` | ✅ | Get order detail |
| PATCH | `/api/materials/orders/:id` | ✅ | Update order status / cancel |

### Projects

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | ✅ | List projects (owner-scoped for customers) |
| POST | `/api/projects` | Customer | Create construction project |
| GET | `/api/projects/:id` | ✅ | Get project with linked bookings and orders |
| PATCH | `/api/projects/:id` | ✅ | Update project / cancel |

### Vendors

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/vendors` | ✅ | List verified vendors (filters: `city`, `category`) |
| GET | `/api/vendors/:id` | ✅ | Get vendor profile |
| POST | `/api/vendors` | Admin | Create vendor profile (upgrades user role) |
| PATCH | `/api/vendors/:id` | Vendor/Admin | Update vendor profile |

### Admin — User Management

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users/admin` | Admin | List all users |
| GET | `/api/users/admin/:id` | Admin | Get user by ID |
| POST | `/api/users/admin` | Admin | Create user with any role |
| PATCH | `/api/users/admin/:id` | Admin | Update user role / active status |

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Returns `{ status, db, uptime }` |

---

## Authentication Flow

```
Register / Login
     │
     ▼
{ access (15m), refresh (7d) }
     │
     ├─ Attach to requests: Authorization: Bearer <accessToken>
     │
     ▼
Token expires → POST /api/auth/refresh { refresh }
     │
     ▼
{ access }   ← Only new access token returned (no refresh rotation)
```

The frontend's `axios` interceptor in `src/api/client.js` automatically handles 401 responses by calling refresh and retrying the original request.

---

## Booking & Quotation Workflow

```
Customer creates booking  →  pending
Admin assigns vendor       →  vendor_assigned
Vendor inspects            →  inspection_completed
Vendor creates quotation (draft)
Vendor sends quotation     →  quotation_sent     (booking auto-advances)
Customer accepts/rejects   →  quotation_accepted / quotation_rejected
  ↓ accepted
Vendor starts work         →  work_in_progress
Vendor completes           →  completed
```

**Quotation expiry**: Lazy — checked on every read/decision. If `valid_until` has passed, status is atomically set to `expired` before any decision is processed.

**Duplicate quotation guard**: If a booking already has a live draft or active sent quotation, a second `POST /quotations` returns `409`. Previously expired sent quotations are auto-expired to allow re-quoting.

---

## Material Orders & Stock

When an order is placed:
1. Duplicate `material` entries in `items[]` are merged (quantities summed).
2. Each material's current stock is checked and decremented **atomically** using `updateOne({ stock: { $gte: qty } }, { $inc: { stock: -qty } })`.
3. If any item fails (insufficient stock), **all previously applied decrements are rolled back** sequentially.
4. The order document stores a **snapshot** of item names, units, and prices at order time — future price changes don't affect existing orders.

**Cancellation** restores stock for all line items using `$inc`.

---

## State Machines

All status transitions are validated by maps in `src/utils/transitions.js`:

| Resource | Transitions |
|---|---|
| Booking | `pending → confirmed → vendor_assigned → inspection_completed → quotation_sent → quotation_accepted → work_in_progress → completed` (+ `cancelled` from most states) |
| Quotation | `draft → sent → accepted / rejected / expired` |
| MaterialOrder | `pending → confirmed → processing → out_for_delivery → delivered` (+ `cancelled`) |
| Project | `planning → quotation → approved → in_progress → completed` (+ `cancelled`) |

---

## Security

| Concern | Implementation |
|---|---|
| SQL/NoSQL injection | Zod validates and strips all input; object operators in body fields fail type validation |
| Password security | bcrypt with configurable rounds (default 12); timing-safe dummy compare on unknown email |
| JWT | Separate access/refresh secrets; algorithm pinned to HS256; type claim checked on refresh |
| RBAC | `requireRole()` middleware on all protected routes |
| IDOR | DB-level scoping (`filter.user = req.user.id`) — no app-level ownership check after load |
| Rate limiting | 10 req/15 min on auth; 60 req/15 min on refresh; 300/15 min global |
| Role escalation | `role` stripped from public register body; forced to `customer` |
| Mass assignment | Zod `.parse()` strips all unknown keys before reaching Mongoose |
| Security headers | helmet with sane defaults |
| CORS | Explicit allowlist via `CLIENT_ORIGIN` |

---

## Database Indexes & Performance

All compound indexes are aligned to the query patterns of the hot paths:

| Collection | Index | Purpose |
|---|---|---|
| User | `{ email: 1 }` unique | Login lookup |
| User | `{ username: 1 }` unique | Registration uniqueness |
| Booking | `{ user: 1, created_at: -1 }` | Customer dashboard |
| Booking | `{ vendor: 1, created_at: -1 }` | Vendor queue |
| Booking | `{ status: 1, created_at: -1 }` | Admin queue |
| Booking | `{ project: 1 }` | Project aggregation |
| Vendor | `{ is_verified: 1, city: 1 }` | Directory filter |
| Vendor | `{ service_categories: 1 }` | Category-based filter |
| Material | `{ category: 1, is_active: 1 }` | Public catalog |
| Material | `{ vendor: 1 }` | Vendor inventory |
| MaterialOrder | `{ user: 1, created_at: -1 }` | Customer order history |
| MaterialOrder | `{ "items.vendor": 1, created_at: -1 }` | Vendor fulfilment queue |
| MaterialOrder | `{ project: 1 }` | Project aggregation |
| Quotation | `{ booking: 1, status: 1 }` | Quotation lookup + live check |
| ServiceItem | `{ category: 1, is_active: 1 }` | Two-query category listing |

**Verify indexes are hitting:**
```powershell
node scripts/explainQueries.js             # Real data
node scripts/explainQueries.js --bulk 500  # Inserts 500 synthetic bookings, then cleans up
```

---

## Testing

Tests use Node.js built-in `node:test` + supertest + `mongodb-memory-server` (no real DB needed).

```powershell
# Run all tests sequentially (avoids lock file contention)
node --test tests/transitions.test.js tests/contract.test.js tests/auth.test.js tests/validation.test.js tests/rbac.test.js tests/workflows.test.js

# Run a single file
node --test tests/auth.test.js
```

### Test Files

| File | Coverage |
|---|---|
| `transitions.test.js` | State machine unit tests for all four resources |
| `contract.test.js` | Frontend compatibility rules C1–C10 |
| `auth.test.js` | Register/login/refresh/me, role escalation, timing attack, token expiry, deactivation |
| `validation.test.js` | ObjectId format, NoSQL injection, malformed JSON, mass assignment |
| `rbac.test.js` | Customer/vendor/admin permission boundaries and IDOR scenarios |
| `workflows.test.js` | End-to-end booking → quotation → acceptance, lazy expiry, atomic stock rollback |

> [!NOTE]
> Tests run against `mongodb-memory-server` and use a shared singleton to prevent binary download lock contention when multiple suites run concurrently.

---

## Scripts

```powershell
npm run dev          # Start with node --watch (auto-restart on change)
npm run start        # Production start
npm run seed         # Wipe and re-seed all collections with demo data
npm run test         # Run full test suite
npm run db:indexes   # Sync Mongoose indexes to live MongoDB
npm run explain      # Explain hot queries against seeded data
```

---

## Postman

Import both files from `postman/`:

1. `Homico_Backend_API.postman_collection.json` — full request collection
2. `Homico_Local.postman_environment.json` — local environment with `baseUrl`

**Demo credentials** (after `npm run seed`):

| Role | Email | Password |
|---|---|---|
| admin | admin@homico.test | demo_password_123 |
| customer | customer@homico.test | demo_password_123 |
| customer (IDOR test) | customer2@homico.test | demo_password_123 |
| vendor (QuickFix) | vendor1@homico.test | demo_password_123 |
| vendor (BuildRight) | vendor2@homico.test | demo_password_123 |
| vendor (Unverified) | vendor3@homico.test | demo_password_123 |

Login requests auto-set `accessToken` and `refreshToken` collection variables.

---

## Frontend Compatibility

See [`docs/COMPATIBILITY.md`](docs/COMPATIBILITY.md) for the full specification of all 13 compatibility rules, verified frontend API call shapes, edge cases (no refresh rotation, error body key order for `RegisterForm.jsx`), and suggested improvements.

**Key rules:**
- **C1**: Raw JSON responses — no `{ success, data }` envelope
- **C2**: Error bodies put field-error keys first so `Object.values(data)[0]?.[0]` reaches the error string
- **C3**: All fields use `snake_case`
- **C4**: Documents expose `id` (string), not `_id`
- **C8**: Public catalog routes (`/services/*`, `/materials`) don't inspect `Authorization` header
- **C13**: `/auth/refresh` returns only `{ access }` — no refresh token rotation

