# Product Management API — Project Progress
### Learning Journey

**Project Type:** Product Management REST API (Amazon Admin Panel Inspired)

---

## Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js | Runtime |
| Express.js v5 | Web framework |
| MongoDB Atlas | Cloud database |
| Mongoose | ODM for MongoDB |
| Zod | Request validation |
| JWT | Authentication (Access + Refresh tokens) |
| bcrypt | Password hashing |
| Helmet | Security headers |
| CORS | Cross-origin access |
| express-rate-limit | Abuse protection |
| Morgan | HTTP request logging |
| dotenv | Environment variables |
| cookie-parser | Read httpOnly cookies |

---

## Project Goal

Build a production-ready backend the same way real companies build it — not just CRUD, but:

- Clean layered architecture (MVC + Repository Pattern)
- Professional error handling
- Pagination, Search, Filtering, Sorting
- JWT Authentication with Refresh Tokens
- Role-Based Access Control (RBAC)
- Image Upload, Caching, Testing, Docker, Deployment (upcoming)
- React frontend integration (upcoming)

---

## Architecture

```
Client → Routes → Controller → Service → Repository → MongoDB
```

| Layer | Responsibility | Rule |
|-------|---------------|------|
| Routes | Map URL to controller | No logic |
| Controller | Read request, call service, send response | No business logic, no DB |
| Service | Business rules and decisions | No DB queries |
| Repository | All database operations | No business logic |
| Model | MongoDB schema (blueprint) | Define structure only |

---

# ✅ Phase 1 — Project Setup

## Objective
Create a strong project foundation before writing any feature code.

## What Was Done
- Initialized Node.js project (`npm init`)
- Installed all required packages
- Created the full folder structure
- Configured `.env` for environment variables
- Set up `npm run dev` (nodemon) and `npm start` scripts

## Folder Structure Created
```
src/
├── config/       database connection
├── controllers/  request handlers
├── middlewares/  auth, error, role
├── models/       Mongoose schemas
├── repositories/ database queries
├── routes/       URL to controller mapping
├── services/     business logic
├── utils/        reusable helpers
├── validators/   Zod schemas
├── app.js
└── server.js
```

## Why This Structure?
Each folder has one job. If a bug is in business logic, look at services. If it's a DB issue, look at repositories. No need to search everywhere.

## Packages Installed

| Package | Why |
|---------|-----|
| express | Web framework |
| mongoose | Work with MongoDB using schemas |
| dotenv | Load .env variables |
| helmet | Add security headers automatically |
| cors | Allow frontend to call the API |
| morgan | Log every HTTP request |
| express-rate-limit | Block too many requests from one IP |
| zod | Validate request bodies cleanly |
| bcrypt | Hash passwords (used in Phase 10) |
| jsonwebtoken | JWT auth (used in Phase 10) |
| cookie-parser | Read cookies (used in Phase 12) |
| nodemon | Auto-restart server on file change |

## Status
✅ Completed

---

# ✅ Phase 2 — Backend Foundation

## Objective
Build the application backbone: Express app, MongoDB connection, server entry point.

## What Was Done
- Created `server.js` — entry point, connects DB then starts server
- Created `app.js` — sets up all Express middleware and routes
- Created `config/database.js` — MongoDB Atlas connection
- Added base health-check route at `GET /api`

## Server Startup Flow
```
server.js
  │
  ▼  load .env
  │
  ▼  connectDB() — MongoDB Atlas
  │
  ▼  app.listen() — Express server starts
```

## Why Separate server.js and app.js?
- `app.js` handles Express configuration (routes, middleware)
- `server.js` handles DB connection and port binding
- This separation makes future unit testing easier

## Why MongoDB Atlas?
- Cloud hosted — no local setup needed
- Accessible from anywhere, including deployed servers
- Industry standard for Node.js projects

## Why Mongoose Over Raw MongoDB Driver?
- Schemas enforce structure on documents
- Built-in type validation
- Cleaner query syntax

## Status
✅ Completed

---

# ✅ Phase 3 — Product Module

## Objective
Build the full product module using a layered architecture — every layer has exactly one job.

## What Was Done

### Product Model (`models/product.model.js`)
Defines how a product is stored in MongoDB.

Fields:
- `name` — required, 3–100 chars
- `description` — required, up to 1000 chars
- `price` — required, cannot be negative
- `category` — required
- `brand` — optional
- `stock` — required, cannot be negative
- `image` — optional URL (Phase 13 will replace with Cloudinary)
- `isActive` — soft delete flag, default true
- `createdAt / updatedAt` — added automatically via `timestamps: true`

### Product Validator (`validators/product.validator.js`)
Validates incoming request data using Zod before it reaches the service.

- `createProductSchema` — all required fields
- `updateProductSchema` — same fields, all optional (via `.partial()`)

### Why Validate Twice?
```
Zod      → protects the API, returns clean readable errors
Mongoose → protects the database, last-line enforcement
```

### Product Repository (`repositories/product.repository.js`)
Only database operations. No business logic.

Methods: `create`, `findById`, `findByName`, `updateById`, `deleteById`, `findAll`

### Product Service (`services/product.service.js`)
Business logic only. Never talks to DB directly.

- `createProduct` — checks for duplicate name before saving
- `getProductById` — throws 404 if not found
- `updateProduct` — throws 404 if product doesn't exist
- `deleteProduct` — throws 404 if product doesn't exist
- `getAllProducts` — delegates to repository (returns empty array, never throws)

### Product Controller (`controllers/product.controller.js`)
Thin layer. Reads `req`, calls service, sends response.

### Product Routes (`routes/product.routes.js`)
Maps URLs to controller methods.

## Status
✅ Completed

---

# ✅ Phase 4 — Professional Error Handling

## Objective
Replace ad-hoc error handling with a consistent, reusable system across the entire app.

## What Was Done

### `utils/ApiError.js`
Custom Error class that carries both a message AND an HTTP status code.

```javascript
// Before Phase 4 — no status code, generic error
throw new Error("Product not found")

// After Phase 4 — status code travels with the error
throw new ApiError(404, "Product not found")
```

### `utils/ApiResponse.js`
Standard wrapper for ALL successful responses.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products fetched successfully",
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Every success response in the app has the same shape.

### `utils/asyncHandler.js`
Wraps async controller functions so errors are caught automatically.

```javascript
// Without asyncHandler — try-catch in every single controller
createProduct = async (req, res, next) => {
  try {
    ...
  } catch (error) {
    next(error)  // had to write this everywhere
  }
}

// With asyncHandler — clean, no repetition
createProduct = asyncHandler(async (req, res) => {
  ...  // any thrown error goes to global error middleware automatically
})
```

### `middlewares/error.middleware.js`
Global error handler registered last in `app.js`.

Catches every error passed to `next(error)` anywhere in the app and sends a clean JSON error response.

## Status
✅ Completed

---

# ✅ Phase 5 — Product CRUD

## Objective
Complete all five product operations with proper validation, error handling, and clean responses.

## Endpoints Implemented

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | /api/products | None (Phase 11 adds auth) | Create product |
| GET | /api/products | None | Get all products |
| GET | /api/products/:id | None | Get product by ID |
| PUT | /api/products/:id | None (Phase 11 adds auth) | Update product |
| DELETE | /api/products/:id | None (Phase 11 adds auth) | Delete product |

## Key Behaviors
- `POST` — validates body with Zod, checks duplicate name in service, saves
- `GET all` — returns empty array (never a 404) if no products
- `GET by id` — returns 404 if not found
- `PUT` — validates body with `updateProductSchema.partial()` (only send fields you want to change)
- `DELETE` — returns 404 if product doesn't exist

## Status
✅ Completed

---

# ✅ Phase 6 — Pagination

## Objective
Stop returning ALL products in one response. Return a page at a time.

## What Was Done
Query parameters added to `GET /api/products`:
- `page` — page number (default: 1)
- `limit` — results per page (default: 10)

## MongoDB Implementation
```javascript
skip = (page - 1) * limit  // how many documents to skip

Product.find()
  .skip(skip)
  .limit(limit)

totalProducts = await Product.countDocuments()
totalPages    = Math.ceil(totalProducts / limit)
```

## Pagination Metadata Returned
```json
"pagination": {
  "totalProducts": 25,
  "currentPage": 2,
  "totalPages": 5,
  "limit": 5,
  "hasNextPage": true,
  "hasPrevPage": true
}
```

## Why Pagination?
Without it, every request loads the entire database — slow, expensive, poor UX.
With it, the frontend loads just what it displays.

## Status
✅ Completed

---

# ✅ Phase 7 — Search

## Objective
Let users search products by name.

## What Was Done
Query parameter: `?search=iphone`

## MongoDB Implementation
```javascript
// $regex searches for a pattern inside the name field
// $options: "i" makes it case-insensitive
filter.name = { $regex: search, $options: "i" }
```

So `iphone`, `IPHONE`, and `iPhone` all return the same results.

## How It Combines With Pagination
The `countDocuments(filter)` call uses the same filter object, so pagination counts ONLY matching products, not the entire collection.

## Example
```
GET /api/products?search=iphone&page=1&limit=5
```

## Status
✅ Completed

---

# ✅ Phase 8 — Filtering

## Objective
Let users filter products by category, brand, and price range.

## What Was Done
Query parameters added:
- `?category=Mobile`
- `?brand=Apple`
- `?minPrice=20000`
- `?maxPrice=80000`

## MongoDB Implementation
```javascript
// Category — exact match
if (category) filter.category = category

// Brand — exact match
if (brand) filter.brand = brand

// Price range — $gte (>=) and $lte (<=)
if (minPrice || maxPrice) {
  filter.price = {}
  if (minPrice) filter.price.$gte = Number(minPrice)
  if (maxPrice) filter.price.$lte = Number(maxPrice)
}
```

## Filters Stack Together
All filters, search, and pagination work together in one query:
```
GET /api/products?search=phone&category=Mobile&brand=Apple&minPrice=50000&maxPrice=100000&page=1&limit=5
```

## Status
✅ Completed

---

# ✅ Phase 9 — Sorting

## Objective
Let users control the order of results.

## What Was Done
Query parameter: `?sort=field` or `?sort=-field`

- `?sort=price` → ascending (cheapest first)
- `?sort=-price` → descending (most expensive first)
- `?sort=name` → A to Z
- `?sort=-createdAt` → newest first (default)

## Allowed Sort Fields
`price`, `name`, `createdAt`, `stock`, `brand`, `category`

Fields outside this list are ignored and fall back to `-createdAt`.

## Why Validate Sort Fields?
Without validation, a user could pass any MongoDB field name and retrieve unexpected data. Whitelisting prevents that.

## MongoDB Implementation
```javascript
const sortOption = {}
sortOption[sortField] = sortOrder  // { price: -1 } or { name: 1 }

Product.find(filter).sort(sortOption).skip(skip).limit(limit)
```

## Status
✅ Completed

---

# ✅ Phase 10 — JWT Authentication

## Objective
Add user accounts: register, login, and protect routes with JWT.

## What Was Done

### User Model (`models/user.model.js`)
Fields: `name`, `email` (unique), `password` (hashed), `role` (user/admin), `isActive`, `refreshToken` (added Phase 12)

### User Validator (`validators/user.validator.js`)
- `registerSchema` — name, email, password
- `loginSchema` — email, password

### User Repository (`repositories/user.repository.js`)
Methods: `create`, `findByEmail`, `findById`

### User Service (`services/user.service.js`)
- `register()` — checks duplicate email, hashes password with bcrypt (saltRounds: 10), saves user
- `login()` — finds user by email, compares password with `bcrypt.compare`, issues JWT

### Auth Middleware (`middlewares/auth.middleware.js`)
- Reads `Authorization: Bearer <token>` header
- Verifies JWT signature and expiry
- Attaches `{ id, role }` to `req.user`
- Passes 401 if token is missing or invalid

### User Routes (`routes/user.routes.js`)
- `POST /api/users/register`
- `POST /api/users/login`
- `GET  /api/users/profile` (protected)

## Why Not Store Plain Passwords?
If the database is breached, plain passwords expose every user's account (and likely other sites they use the same password on). bcrypt makes each password computationally expensive to crack.

## Status
✅ Completed

---

# ✅ Phase 11 — Role-Based Access Control (RBAC)

## Objective
Restrict product write operations so only admin users can create, update, or delete products.

## What Was Done

### Role Middleware (`middlewares/role.middleware.js`)
`authorize("admin")` — checks `req.user.role` (set by auth middleware).

```
If role not in allowed list → 403 Forbidden
If role matches           → next() — allow request
```

### Product Routes Updated
```javascript
// Before Phase 11 — no protection
router.post("/", productController.createProduct)

// After Phase 11 — auth + role check
router.post("/", auth, authorize("admin"), productController.createProduct)
```

### Access Matrix

| Action | Guest | User | Admin |
|--------|-------|------|-------|
| View products | ✅ | ✅ | ✅ |
| Create product | ❌ 401 | ❌ 403 | ✅ |
| Update product | ❌ 401 | ❌ 403 | ✅ |
| Delete product | ❌ 401 | ❌ 403 | ✅ |

- **401** = no token sent (auth middleware rejects)
- **403** = token valid but role is not admin (role middleware rejects)

## Status
✅ Completed

---

# ✅ Phase 12 — Refresh Token Authentication

## Objective
Replace the single long-lived JWT with a secure two-token system that supports rotation and server-side logout.

## Problem With Phase 10
A single JWT with a long expiry (`7d`) is a security risk. If it is stolen, the attacker has full access until it expires. There is no way to revoke it — JWTs are stateless.

## Solution — Two Token System

| Token | Expiry | Stored | Sent Via |
|-------|--------|--------|---------|
| Access Token | 15 minutes | Client memory | Authorization header |
| Refresh Token | 7 days | DB (hashed) | httpOnly cookie |

The access token is short-lived — stolen copies expire quickly. The refresh token lives in an httpOnly cookie — JavaScript cannot read it even if there is an XSS attack.

## What Changed in Each File

### `.env`
- `JWT_EXPIRES_IN` changed from `7d` to `15m`
- Added `JWT_REFRESH_SECRET` — separate secret for refresh tokens
- Added `JWT_REFRESH_EXPIRES_IN=7d`

### `utils/token.utils.js` (was empty — now implemented)
- `generateAccessToken(user)` — signs with `JWT_SECRET`
- `generateRefreshToken(user)` — signs with `JWT_REFRESH_SECRET`
- `verifyAccessToken(token)` — verifies with `JWT_SECRET`
- `verifyRefreshToken(token)` — verifies with `JWT_REFRESH_SECRET`

Why separate secrets? A stolen access secret cannot be used to forge refresh tokens.

### `models/user.model.js`
Added `refreshToken` field: `String, default: null, select: false`

`select: false` means the field is excluded from all normal queries — it never leaks into responses.

### `repositories/user.repository.js`
Added:
- `findByIdWithRefreshToken(id)` — uses `.select("+refreshToken")` to explicitly fetch the field
- `setRefreshToken(id, hashedToken)` — saves bcrypt hash after login or refresh
- `clearRefreshToken(id)` — sets to null on logout

### `services/user.service.js`
- `issueTokens(user)` — NEW: generates access + refresh pair, stores hash in DB
- `login()` — CHANGED: now returns `{ accessToken, refreshToken, user }` instead of `{ token, user }`
- `refresh(token)` — NEW: verifies token, compares against DB hash, issues new pair
- `logout(userId)` — NEW: clears DB hash
- FIXED: removed `console.log(JWT_SECRET)` security leak

### `controllers/user.controller.js`
- `login` — sets refresh token as httpOnly cookie, access token in JSON body
- `refresh` — NEW: reads cookie, rotates token pair
- `logout` — NEW: clears cookie + calls service

Cookie options:
```javascript
{
  httpOnly: true,                               // JS cannot read
  secure: process.env.NODE_ENV === "production",// HTTPS only in prod
  sameSite: "strict",                           // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000             // 7 days in ms
}
```

### `routes/user.routes.js`
- Added `POST /api/users/refresh` — public, reads cookie
- Added `POST /api/users/logout` — protected, needs access token

### `app.js`
- Added `cookie-parser` middleware — makes `req.cookies` available
- Updated CORS with `credentials: true` — browser sends cookies cross-origin

### Cleanup
- Deleted empty `src/errors/ApiError.js` (was a duplicate of `src/utils/ApiError.js`)

## Token Rotation Flow
```
Login
  │
  ▼
Issue Access Token (15m) + Refresh Token (7d)
Store HASH of refresh token in DB
  │
  ├── Access Token → JSON body → client stores in memory
  └── Refresh Token → httpOnly cookie → browser stores automatically
  │
Access Token expires after 15m
  │
  ▼
POST /api/users/refresh
Browser sends cookie automatically
  │
  ▼
Service:
  1. verifyRefreshToken(token) → check signature + expiry
  2. Load user + stored hash from DB
  3. bcrypt.compare(incoming, storedHash) → must match
  4. issueTokens(user) → new pair, new hash overwrites old
  │
  ▼
New Access Token returned in JSON
New Refresh Token set in cookie
Old refresh token is now invalid (hash overwritten)
  │
  ▼
POST /api/users/logout
  │
  ▼
DB hash set to null
Cookie cleared from browser
Session fully revoked — even an old cookie cannot refresh
```

## Status
✅ Completed

---

# Next — Phase 13 (Pending)

## Image Upload
- Multer — handle multipart/form-data
- Cloudinary — cloud image storage
- Image URL stored on product document
- Replace the current plain URL string field

## Status
⏳ Pending

---

# Upcoming Phases Summary

| Phase | Feature | Status |
|-------|---------|--------|
| 13 | Image Upload (Multer + Cloudinary) | ⏳ Pending |
| 14 | Advanced MongoDB (Aggregation, Indexes, Transactions) | ⏳ Pending |
| 15 | Caching (Redis) | ⏳ Pending |
| 16 | API Documentation (Swagger / OpenAPI) | ⏳ Pending |
| 17 | Testing (Unit + Integration) | ⏳ Pending |
| 18 | Docker (Dockerfile + Docker Compose) | ⏳ Pending |
| 19 | Deployment (Render / Railway) | ⏳ Pending |
| 20 | React Frontend (React 19, Vite, Tailwind CSS) | ⏳ Pending |
