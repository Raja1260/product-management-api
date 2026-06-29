# Role-Based Access Control (RBAC) — Phase 11

## Concept

Authentication (Phase 10) answers: **Who are you?**
Authorization (Phase 11) answers: **What are you allowed to do?**

## Access Matrix

| Action | Guest (no token) | User (token, role=user) | Admin (token, role=admin) |
|--------|-----------------|------------------------|--------------------------|
| GET /api/products | ✅ Allow | ✅ Allow | ✅ Allow |
| GET /api/products/:id | ✅ Allow | ✅ Allow | ✅ Allow |
| POST /api/products | ❌ 401 | ❌ 403 | ✅ Allow |
| PUT /api/products/:id | ❌ 401 | ❌ 403 | ✅ Allow |
| DELETE /api/products/:id | ❌ 401 | ❌ 403 | ✅ Allow |

- **401** = No token / invalid token (auth middleware rejects)
- **403** = Token valid but role is not admin (role middleware rejects)

## Middleware Flow

```
Route with auth + authorize("admin")
  │
  ▼
auth.middleware.js
  → reads Authorization: Bearer <token>
  → jwt.verify(token, JWT_SECRET)
  → attaches req.user = { id, role }
  → calls next()
  │
  ▼
role.middleware.js → authorize("admin")
  → checks req.user.role
  → if role === "admin" → next()
  → if not → 403 Forbidden
  │
  ▼
Controller runs
```

---

## Base URL
```
http://localhost:5000/api
```

---

## Testing Guide (Postman)

Enable the **Cookie Jar** in Postman so httpOnly cookies are handled automatically.

---

### Step 1 — Register a User

```
POST http://localhost:5000/api/users/register
```

Body:
```json
{
  "name": "Raj",
  "email": "raj@gmail.com",
  "password": "123456"
}
```

Expected: `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

---

### Step 2 — Login

```
POST http://localhost:5000/api/users/login
```

Body:
```json
{
  "email": "raj@gmail.com",
  "password": "123456"
}
```

Expected: `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "...",
      "name": "Raj",
      "email": "raj@gmail.com",
      "role": "user"
    }
  }
}
```

Copy the `accessToken`. The refresh token is automatically set as a cookie.

> Phase 12 note: `accessToken` expires in **15 minutes**. When it expires, call `POST /api/users/refresh` to get a new one.

---

### Step 3 — Test Profile Route

```
GET http://localhost:5000/api/users/profile
Authorization: Bearer <accessToken>
```

Expected: `200 OK`

If this returns 401, authentication is not working. Fix this before testing RBAC.

---

### Step 4 — Make a User an Admin

Open MongoDB Atlas → your cluster → `users` collection.

Find the user and change:
```json
"role": "user"  →  "role": "admin"
```

**Important:** Log in AGAIN after changing the role.

The old token still has `role: "user"` embedded in it. A fresh login generates a new token with `role: "admin"`.

---

### Step 5 — Test Product Routes

#### GET Products (Public)
```
GET http://localhost:5000/api/products
```
No token needed. Expected: `200 OK`

#### GET Product By ID (Public)
```
GET http://localhost:5000/api/products/:id
```
No token needed. Expected: `200 OK`

#### Create Product (Admin Only)
```
POST http://localhost:5000/api/products
Authorization: Bearer <adminAccessToken>
```
Body:
```json
{
  "name": "MacBook Air M4",
  "description": "Apple Laptop with M4 chip",
  "price": 129999,
  "category": "Laptop",
  "brand": "Apple",
  "stock": 10,
  "image": "https://images.unsplash.com/photo-1517336714739-489689fd1ca8"
}
```
Expected: `201 Created`

#### Update Product (Admin Only)
```
PUT http://localhost:5000/api/products/:id
Authorization: Bearer <adminAccessToken>
```
Body (only send fields you want to change):
```json
{
  "price": 119999,
  "stock": 20
}
```
Expected: `200 OK`

#### Delete Product (Admin Only)
```
DELETE http://localhost:5000/api/products/:id
Authorization: Bearer <adminAccessToken>
```
Expected: `200 OK`

---

### Step 6 — Test Refresh Token (Phase 12)

```
POST http://localhost:5000/api/users/refresh
```

No body needed. Postman sends the cookie automatically.

Expected: `200 OK`
```json
{
  "data": { "accessToken": "eyJhbGci..." }
}
```

The old refresh token is now invalid. A new one is set in the cookie.

---

### Step 7 — Test Logout (Phase 12)

```
POST http://localhost:5000/api/users/logout
Authorization: Bearer <accessToken>
```

Expected: `200 OK`

After logout:
- Cookie is cleared
- DB hash is set to null
- Calling `/refresh` will now return 401

---

## Common Errors

| Error | Status | Reason |
|-------|--------|--------|
| Access denied | 401 | No Authorization header sent |
| Invalid Token | 401 | Token expired, modified, or wrong secret |
| You are not authorized | 403 | Token valid but role is not admin |
| Refresh token missing | 401 | No refresh cookie sent |
| Refresh token revoked | 401 | Token already rotated or logout was called |
| Invalid or expired refresh token | 401 | Token signature failed or past 7-day expiry |

---

## Authorization Header Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

The word `Bearer` followed by a single space followed by the token.

---

## Testing Order in Postman

```
1. Register
2. Login → copy accessToken, cookie set automatically
3. GET /api/users/profile → confirm auth works
4. Change role to admin in MongoDB Atlas
5. Login again → get new token with role=admin
6. POST /api/products → confirm admin access
7. PUT /api/products/:id → confirm update
8. DELETE /api/products/:id → confirm delete
9. POST /api/users/refresh → confirm token rotation
10. POST /api/users/logout → confirm session revoked
```
