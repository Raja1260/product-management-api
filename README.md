# Product Management API

A production-ready Node.js REST API built to learn professional backend architecture from scratch — not just CRUD, but clean layered design, auth, RBAC, token rotation, and more.

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Runtime | Node.js, Express.js v5 |
| Database | MongoDB Atlas, Mongoose |
| Validation | Zod |
| Authentication | JWT (Access + Refresh Token), bcrypt |
| Security | Helmet, CORS, express-rate-limit |
| Logging | Morgan |
| Config | dotenv |

---

## Project Structure

```
src/
├── config/          database.js
├── controllers/     user.controller.js, product.controller.js
├── services/        user.service.js, product.service.js
├── repositories/    user.repository.js, product.repository.js
├── models/          user.model.js, product.model.js
├── routes/          index.js, user.routes.js, product.routes.js
├── validators/      user.validator.js, product.validator.js
├── middlewares/     auth.middleware.js, role.middleware.js, error.middleware.js
├── utils/           ApiResponse.js, ApiError.js, asyncHandler.js, token.utils.js
├── app.js
└── server.js

doc/
├── PROJECT_PROGRESS.md
├── CHANGELOG.md
├── BACKEND_NOTES.md
├── API_DOCUMENTATION.md
└── RBAC.md
```

---

## Architecture

```
Client → Routes → Controller → Service → Repository → MongoDB
```

| Layer | Responsibility |
|-------|---------------|
| Routes | Map URLs to controllers |
| Controller | Read request, call service, send response |
| Service | Business logic (no DB access) |
| Repository | Database queries only (no business logic) |
| Model | Mongoose schema / blueprint |

---

## API Endpoints

### Auth

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/users/register | Public |
| POST | /api/users/login | Public |
| POST | /api/users/refresh | Public (cookie) |
| POST | /api/users/logout | Protected |
| GET | /api/users/profile | Protected |

### Products

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/products | Public |
| GET | /api/products/:id | Public |
| POST | /api/products | Admin only |
| PUT | /api/products/:id | Admin only |
| DELETE | /api/products/:id | Admin only |

### Product List — Query Parameters

```
GET /api/products?page=1&limit=10&search=iphone&category=Mobile&brand=Apple&minPrice=50000&maxPrice=100000&sort=-price
```

| Param | Default | Description |
|-------|---------|-------------|
| page | 1 | Page number |
| limit | 10 | Results per page |
| search | — | Name search (case-insensitive) |
| category | — | Filter by category |
| brand | — | Filter by brand |
| minPrice | — | Minimum price |
| maxPrice | — | Maximum price |
| sort | — | Field to sort (`-` prefix = descending) |

---

## Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {},
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

## Completed Phases

| Phase | Feature | Key Details |
|-------|---------|-------------|
| 1 | Project Setup | Folder structure, packages, env, scripts |
| 2 | Backend Foundation | Express server, MongoDB Atlas connection |
| 3 | Product Module | Model, Validator, Repository, Service, Controller, Routes |
| 4 | Error Handling | ApiError, ApiResponse, asyncHandler, global error middleware |
| 5 | Product CRUD | POST, GET, GET/:id, PUT, DELETE |
| 6 | Pagination | `page`, `limit`, skip/limit/countDocuments, pagination metadata |
| 7 | Search | `?search=` with MongoDB `$regex`, case-insensitive |
| 8 | Filtering | `category`, `brand`, `minPrice`, `maxPrice` |
| 9 | Sorting | `?sort=field` / `?sort=-field` on price, name, createdAt, stock, brand, category |
| 10 | JWT Authentication | Register, Login (bcrypt), Auth middleware, Profile route |
| 11 | RBAC | `authorize()` middleware, admin-only write routes, 401/403 responses |
| 12 | Refresh Token | Access token (15m) + Refresh token (7d), token rotation, httpOnly cookie, server-side revocation on logout |

---

## Upcoming Phases

| Phase | Feature | Tools |
|-------|---------|-------|
| 13 | Image Upload | Multer, Cloudinary |
| 14 | Advanced MongoDB | Aggregation, Populate, Indexes, Transactions |
| 15 | Caching | Redis |
| 16 | API Documentation | Swagger / OpenAPI |
| 17 | Testing | Unit Testing, Integration Testing |
| 18 | Docker | Dockerfile, Docker Compose |
| 19 | Deployment | Render / Railway, production env |
| 20 | React Frontend | React 19, Vite, Tailwind CSS, Axios, TanStack Query, React Router |

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri

JWT_SECRET=your_access_token_secret
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=7d
```

---

## Run Locally

```bash
npm install
npm run dev      # nodemon
npm start        # node
```

> Requires Node.js v20+

---

## Overall Status

✅ Phase 1–12 complete — MVC + Repository Pattern, full Product CRUD, Pagination, Search, Filter, Sort, JWT Auth, RBAC, Refresh Token with rotation and revocation.

**Next:** Phase 13 — Image Upload (Multer + Cloudinary)

## ⭐ Overall Status

Your project has evolved beyond a CRUD application. It now includes:

* ✅ MVC Architecture
* ✅ Repository Pattern
* ✅ Service Layer
* ✅ Professional Error Handling
* ✅ CRUD APIs
* ✅ Pagination
* ✅ Search
* ✅ Filtering
* ✅ Sorting
* ✅ JWT Authentication
* ✅ Password Hashing
* ✅ Role-Based Access Control (RBAC)
* ✅ Protected Routes

This is a strong backend foundation. The next logical milestone phase-13 **Image Upload**, **Swagger**, **Testing**, **Docker**, **Deployment**, and finally a **React + Tailwind CSS** frontend.
