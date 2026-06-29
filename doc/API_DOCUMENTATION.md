# 🌐 Product Management API — Documentation

Base URL

```
http://localhost:5000/api
```

---

# Authentication Endpoints

---

## Register User

POST

```
/users/register
```

Request Body

```json
{
  "name": "Raj",
  "email": "raj@gmail.com",
  "password": "123456"
}
```

Success Response

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "name": "Raj",
    "email": "raj@gmail.com",
    "role": "user"
  }
}
```

---

## Login

POST

```
/users/login
```

Request Body

```json
{
  "email": "raj@gmail.com",
  "password": "123456"
}
```

Success Response

```json
{
  "success": true,
  "statusCode": 200,
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

Notes

- `accessToken` is returned in the response body (expires in 15 minutes).
- `refreshToken` is set automatically as an **httpOnly secure cookie**.

---

## Refresh Token

POST

```
/users/refresh
```

Headers

```
Cookie: refreshToken=<auto-sent by browser>
```

No request body needed.

Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGci..."
  }
}
```

Notes

- The old refresh token is invalidated (rotation).
- A new refresh token cookie is set automatically.
- Call this endpoint when you receive a 401 on a protected route.

Error Responses

```json
{ "success": false, "message": "Refresh token missing" }
{ "success": false, "message": "Invalid or expired refresh token" }
{ "success": false, "message": "Refresh token revoked" }
```

---

## Logout

POST

```
/users/logout
```

Headers

```
Authorization: Bearer <accessToken>
Cookie: refreshToken=<auto-sent by browser>
```

Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

Notes

- Clears the httpOnly cookie.
- Deletes the stored refresh token hash from DB (session revoked server-side).

---

## Get Profile

GET

```
/users/profile
```

Headers

```
Authorization: Bearer <accessToken>
```

Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "_id": "...",
    "name": "Raj",
    "email": "raj@gmail.com",
    "role": "user",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

# Product Endpoints

---

## Create Product

POST

```
/products
```

Headers

```
Authorization: Bearer <adminAccessToken>
```

Request Body

```json
{
  "name": "iPhone 16",
  "description": "Latest Apple Phone",
  "price": 89999,
  "category": "Mobile",
  "brand": "Apple",
  "stock": 20,
  "image": "https://example.com/image.jpg"
}
```

Success Response

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Product created successfully",
  "data": { ... }
}
```

---

## Get All Products

GET

```
/products
```

No token required.

Query Parameters

| Parameter | Type   | Default | Description                  |
|-----------|--------|---------|------------------------------|
| page      | Number | 1       | Current page number           |
| limit     | Number | 10      | Products per page             |
| search    | String | —       | Search by name (case-insensitive) |
| category  | String | —       | Filter by category            |
| brand     | String | —       | Filter by brand               |
| minPrice  | Number | —       | Minimum price                 |
| maxPrice  | Number | —       | Maximum price                 |
| sort      | String | —       | Sort field (prefix `-` for desc) |

Example

```
GET /api/products?page=1&limit=5&search=iphone&category=Mobile&brand=Apple&minPrice=50000&maxPrice=100000&sort=-price
```

Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products fetched successfully",
  "data": {
    "products": [ { "_id": "...", "name": "iPhone 16", "price": 89999 } ],
    "pagination": {
      "totalProducts": 25,
      "currentPage": 1,
      "totalPages": 5,
      "limit": 5,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## Get Product By ID

GET

```
/products/:id
```

No token required.

Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product fetched successfully",
  "data": { ... }
}
```

---

## Update Product

PUT

```
/products/:id
```

Headers

```
Authorization: Bearer <adminAccessToken>
```

Request Body (any updatable fields — all are optional)

```json
{
  "price": 79999,
  "stock": 30
}
```

Notes
- Only send fields you want to change
- Uses `updateProductSchema.partial()` — all fields optional
- Returns 404 if product does not exist
- Returns 403 if token is valid but role is not admin

Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product updated successfully",
  "data": {
    "_id": "...",
    "name": "iPhone 16",
    "price": 79999,
    "stock": 30,
    "updatedAt": "..."
  }
}
```

---

## Delete Product

DELETE

```
/products/:id
```

Headers

```
Authorization: Bearer <adminAccessToken>
```

Notes
- Returns 404 if product does not exist
- Returns 403 if token is valid but role is not admin
- Permanently removes the document from MongoDB

Success Response

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product deleted successfully",
  "data": null
}
```

---

# Standard Response Format

## Success

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {},
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Error

```json
{
  "success": false,
  "message": "...",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

# Common Error Responses

## 400 Bad Request — Validation Error
```json
{
  "success": false,
  "message": "Email already registered"
}
```
```json
{
  "success": false,
  "message": "Product with this name already exists"
}
```

## 401 Unauthorized
```json
{ "success": false, "message": "Access denied" }
{ "success": false, "message": "Invalid Token" }
{ "success": false, "message": "Refresh token missing" }
{ "success": false, "message": "Invalid or expired refresh token" }
{ "success": false, "message": "Refresh token revoked" }
```

## 403 Forbidden
```json
{
  "success": false,
  "message": "You are not authorized to perform this action"
}
```

## 404 Not Found
```json
{ "success": false, "message": "Product not found" }
{ "success": false, "message": "User not found" }
```

## 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

# HTTP Status Codes Used

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Successful GET, PUT, DELETE, POST /refresh, POST /logout |
| 201 | Created | Successful POST /products, POST /register |
| 400 | Bad Request | Duplicate email, duplicate product name, Zod validation fail |
| 401 | Unauthorized | Missing token, expired token, invalid refresh token |
| 403 | Forbidden | Valid token but wrong role |
| 404 | Not Found | Product or user does not exist |
| 500 | Internal Server Error | Unexpected server crash |
