# Changelog — Product Management API

All changes to this project, phase by phase.

---

## Phase 1 — Project Setup

### Added
- Initialized Node.js project with `npm init`
- Installed all dependencies: express, mongoose, dotenv, helmet, cors, morgan, express-rate-limit, zod, bcrypt, jsonwebtoken, cookie-parser
- Created full folder structure: config, controllers, middlewares, models, repositories, routes, services, utils, validators
- Configured `.env` with PORT and MONGODB_URI
- Added `npm run dev` (nodemon) and `npm start` scripts

---

## Phase 2 — Backend Foundation

### Added
- `server.js` — entry point, loads .env, connects DB, starts server
- `app.js` — Express app setup with helmet, cors, morgan, json parser
- `config/database.js` — MongoDB Atlas connection using Mongoose
- `routes/index.js` — health check at `GET /api`

---

## Phase 3 — Product Module

### Added
- `models/product.model.js` — Mongoose schema: name, description, price, category, brand, stock, image, isActive, timestamps
- `validators/product.validator.js` — Zod schema: createProductSchema, updateProductSchema (partial)
- `repositories/product.repository.js` — create, findById, findByName, updateById, deleteById
- `services/product.service.js` — business logic: duplicate check, existence check
- `controllers/product.controller.js` — thin HTTP handlers calling service
- `routes/product.routes.js` — mounted at `/api/products`

---

## Phase 4 — Professional Error Handling

### Added
- `utils/ApiError.js` — custom Error class with statusCode + message
- `utils/ApiResponse.js` — standard success response: success, statusCode, message, data, timestamp
- `utils/asyncHandler.js` — wraps async controllers so errors auto-route to global middleware
- `middlewares/error.middleware.js` — global error handler, registered last in app.js

---

## Phase 5 — Product CRUD

### Completed
- `POST   /api/products` — create product (Zod validation, duplicate check)
- `GET    /api/products` — get all products
- `GET    /api/products/:id` — get product by MongoDB _id
- `PUT    /api/products/:id` — update product (partial schema, 404 if not found)
- `DELETE /api/products/:id` — delete product (404 if not found)

---

## Phase 6 — Pagination

### Added
- `page` and `limit` query parameters on `GET /api/products`
- MongoDB `.skip()` and `.limit()` in product repository
- `countDocuments()` for total product count
- Pagination metadata in response: totalProducts, currentPage, totalPages, limit, hasNextPage, hasPrevPage
- Default values: page = 1, limit = 10

---

## Phase 7 — Search

### Added
- `search` query parameter on `GET /api/products`
- MongoDB `$regex` with `$options: "i"` for case-insensitive name search
- `countDocuments(filter)` updated to count only matching results

---

## Phase 8 — Filtering

### Added
- `category` query parameter — exact match filter
- `brand` query parameter — exact match filter
- `minPrice` query parameter — `$gte` filter on price
- `maxPrice` query parameter — `$lte` filter on price
- Price range filter when both minPrice and maxPrice are provided

---

## Phase 9 — Sorting

### Added
- `sort` query parameter on `GET /api/products`
- Prefix `-` for descending order (e.g. `?sort=-price`)
- Allowed sort fields: price, name, createdAt, stock, brand, category
- Invalid sort fields fall back to default `-createdAt`
- MongoDB dynamic sort object built at query time

---

## Phase 10 — JWT Authentication

### Added
- `models/user.model.js` — name, email (unique), password, role (user/admin), isActive, timestamps
- `validators/user.validator.js` — registerSchema, loginSchema using Zod
- `repositories/user.repository.js` — create, findByEmail, findById (password excluded)
- `services/user.service.js` — register (bcrypt hash), login (bcrypt compare + JWT sign)
- `controllers/user.controller.js` — register, login, profile handlers
- `middlewares/auth.middleware.js` — reads Bearer token, verifies JWT, attaches req.user
- `routes/user.routes.js` — POST /register, POST /login, GET /profile
- Routes mounted in `app.js` at `/api/users`

---

## Phase 11 — Role-Based Access Control (RBAC)

### Added
- `middlewares/role.middleware.js` — `authorize(...roles)` middleware
- Product routes updated: POST, PUT, DELETE now require `auth + authorize("admin")`
- GET product routes remain public (no token required)

### Behavior
- No token on write route → 401 Unauthorized (auth middleware)
- Token with role "user" on write route → 403 Forbidden (role middleware)
- Token with role "admin" → request allowed

---

## Phase 12 — Refresh Token Authentication

### Added
- `.env` — `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN=7d`
- `utils/token.utils.js` — generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken (separate secrets for each type)
- `models/user.model.js` — `refreshToken` field (String, default null, select: false)
- `repositories/user.repository.js` — findByIdWithRefreshToken, setRefreshToken, clearRefreshToken
- `services/user.service.js` — issueTokens(), refresh(), logout()
- `controllers/user.controller.js` — refresh handler, logout handler; httpOnly cookie for refresh token
- `routes/user.routes.js` — POST /refresh (public), POST /logout (protected)
- `app.js` — cookie-parser middleware, CORS credentials: true

### Changed
- `.env` — `JWT_EXPIRES_IN` from `7d` to `15m`
- `services/user.service.js` — login() now returns accessToken + refreshToken instead of single token
- `controllers/user.controller.js` — login() sets refresh token as httpOnly cookie, returns only accessToken in JSON body

### Fixed
- Removed `console.log(JWT_SECRET)` security leak from user.service.js login method
- Deleted empty `src/errors/ApiError.js` duplicate file
