# Phase 12 — Refresh Token Testing Guide

Complete step-by-step guide to test every feature added in Phase 12.

---

## What Was Built in Phase 12

| Feature | Description |
|---------|-------------|
| Access Token | Short-lived (15 min), returned in JSON body |
| Refresh Token | Long-lived (7 days), stored as httpOnly cookie |
| POST /api/users/refresh | Exchange refresh cookie for new access token |
| POST /api/users/logout | Revoke session server-side + clear cookie |
| Token Rotation | Every refresh issues a new pair, old one is invalidated |
| Server-side revocation | Logout sets DB hash to null, old tokens rejected |

---

## Prerequisites

### 1. Start the Server
```bash
npm run dev
```
Server should log:
```
✅ MongoDB Connected Successfully
🚀 Server is running on http://localhost:5000
```

### 2. Postman Setup — Enable Cookie Jar

The refresh token is an **httpOnly cookie**. Postman must be configured to automatically send and receive cookies.

Steps:
1. Open Postman
2. Click the **Settings** gear icon (top right)
3. Go to **General**
4. Enable **"Automatically follow redirects"**
5. In the request — click **Cookies** tab (under the URL bar) to inspect cookies after each request

> Without cookie jar enabled, Postman won't send the refresh cookie and `/refresh` will always return 401.

### 3. Environment Variables Confirmed in .env
```
JWT_SECRET=mySuperSecretKey123456
JWT_EXPIRES_IN=15m

JWT_REFRESH_SECRET=mySuperSecretRefreshKey987654
JWT_REFRESH_EXPIRES_IN=7d
```

---

## Test Scenarios

---

## Scenario 1 — Register a User

**Request**
```
POST http://localhost:5000/api/users/register
Content-Type: application/json
```

**Body**
```json
{
  "name": "Test User",
  "email": "test@gmail.com",
  "password": "123456"
}
```

**Expected Response — 201 Created**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "id": "...",
    "name": "Test User",
    "email": "test@gmail.com",
    "role": "user"
  }
}
```

**What to verify:**
- Status code is `201`
- `data` does NOT contain the password
- `data` does NOT contain `refreshToken`

---

## Scenario 2 — Login and Check Both Tokens

**Request**
```
POST http://localhost:5000/api/users/login
Content-Type: application/json
```

**Body**
```json
{
  "email": "test@gmail.com",
  "password": "123456"
}
```

**Expected Response — 200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGci...",
    "user": {
      "id": "...",
      "name": "Test User",
      "email": "test@gmail.com",
      "role": "user"
    }
  }
}
```

**What to verify:**

1. `accessToken` is present in the JSON response body
2. `refreshToken` is NOT in the JSON body (it's a cookie, not in the response)
3. In Postman → click **Cookies** tab → you should see:

```
Name:     refreshToken
Domain:   localhost
HttpOnly: ✅ (checked)
Value:    eyJhbGci...  (long JWT string)
```

4. Go to **MongoDB Atlas** → `users` collection → find your user
   - `refreshToken` field should have a **bcrypt hash** (starts with `$2b$10$...`)
   - This is the hash of the refresh token — not the raw token

**Save the `accessToken` — you will need it in the next steps.**

---

## Scenario 3 — Use Access Token on Protected Route

**Request**
```
GET http://localhost:5000/api/users/profile
Authorization: Bearer <paste accessToken here>
```

**Expected Response — 200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "_id": "...",
    "name": "Test User",
    "email": "test@gmail.com",
    "role": "user",
    "isActive": true
  }
}
```

**What to verify:**
- `password` field is NOT in the response
- `refreshToken` field is NOT in the response (it has `select: false`)

---

## Scenario 4 — Call Refresh Endpoint

This tests getting a new access token using the httpOnly cookie.

**Request**
```
POST http://localhost:5000/api/users/refresh
```

No Authorization header needed.
No body needed.
Postman sends the cookie automatically.

**Expected Response — 200 OK**
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

**What to verify:**

1. A new `accessToken` is returned in the body — different from the one you got in Scenario 2
2. In the **Cookies** tab — the `refreshToken` cookie has been **replaced** with a new value (token rotation)
3. In **MongoDB Atlas** → `users` → the `refreshToken` hash has changed (new hash stored)

**Save this new `accessToken`.**

---

## Scenario 5 — Token Rotation (Old Refresh Token Rejected)

This verifies that after a refresh, the old refresh token cannot be used again.

**Setup:**
Before calling `/refresh`, manually copy the current refresh token value from the Postman cookie jar.

After calling `/refresh`:
- A new cookie has been set (the old token is now invalid in DB)

**Simulate reuse: manually set the old token in a request**

In Postman → Cookies → manually edit the `refreshToken` cookie value back to the old token you copied.

Then call:
```
POST http://localhost:5000/api/users/refresh
```

**Expected Response — 401 Unauthorized**
```json
{
  "success": false,
  "message": "Refresh token revoked"
}
```

**What happened:**
The service called `bcrypt.compare(oldToken, currentHash)`. The old token no longer matches the new hash stored in DB → rejected.

---

## Scenario 6 — Logout

**Request**
```
POST http://localhost:5000/api/users/logout
Authorization: Bearer <accessToken>
```

No body needed.
Postman sends the cookie automatically.

**Expected Response — 200 OK**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": null
}
```

**What to verify:**

1. In Postman **Cookies** tab → `refreshToken` cookie is gone (cleared)
2. In **MongoDB Atlas** → `users` → `refreshToken` field is now `null`

---

## Scenario 7 — Refresh After Logout (Should Fail)

After logging out, verify that the refresh endpoint is fully revoked.

**Request**
```
POST http://localhost:5000/api/users/refresh
```

**Expected Response — 401 Unauthorized**
```json
{
  "success": false,
  "message": "Refresh token missing"
}
```

If the cookie was not cleared, you may also get:
```json
{
  "success": false,
  "message": "Refresh token revoked"
}
```

**Both are correct** — either the cookie is gone (missing) or the DB hash is null (revoked).

---

## Scenario 8 — Access Protected Route After Logout

After logout, the access token is still technically valid (it hasn't expired yet). This is expected behavior — access tokens cannot be individually revoked without a DB check on every request. They expire naturally in 15 minutes.

**Request**
```
GET http://localhost:5000/api/users/profile
Authorization: Bearer <old accessToken from before logout>
```

**Expected Response — 200 OK** *(access token still valid for up to 15 min)*

This is intentional. The protection is:
- Refresh token → fully revoked (cannot get new access tokens)
- Access token → expires in 15 minutes on its own

---

## Scenario 9 — No Cookie Sent (Missing Refresh Token)

Test what happens when no cookie is present.

In Postman → Cookies → delete the `refreshToken` cookie manually.

**Request**
```
POST http://localhost:5000/api/users/refresh
```

**Expected Response — 401 Unauthorized**
```json
{
  "success": false,
  "message": "Refresh token missing"
}
```

---

## Scenario 10 — Invalid / Tampered Refresh Token

Test what happens if a corrupted or manually forged token is sent.

In Postman → Cookies → set `refreshToken` value to `"invalid.token.here"`.

**Request**
```
POST http://localhost:5000/api/users/refresh
```

**Expected Response — 401 Unauthorized**
```json
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

**Why:** `jwt.verify()` fails because the signature does not match `JWT_REFRESH_SECRET`.

---

## Scenario 11 — Refresh Without Auth Header (Logout Requires Access Token)

**Request**
```
POST http://localhost:5000/api/users/logout
```
No Authorization header.

**Expected Response — 401 Unauthorized**
```json
{
  "success": false,
  "message": "Access denied"
}
```

**Why:** Logout is a protected route. `auth` middleware requires a valid access token to identify whose session to revoke (`req.user.id`).

---

## Scenario 12 — Login Again After Logout

Verify a fresh login works after logout and a new session is established.

**Request**
```
POST http://localhost:5000/api/users/login
Content-Type: application/json
```

**Body**
```json
{
  "email": "test@gmail.com",
  "password": "123456"
}
```

**Expected Response — 200 OK** with a new `accessToken`

**What to verify:**
- New `accessToken` in response body
- New `refreshToken` cookie set in Postman
- In MongoDB Atlas → `refreshToken` field has a new bcrypt hash

---

## Full Test Checklist

Run through these in order:

```
[ ] 1.  POST /register                     → 201, no password in response
[ ] 2.  POST /login                        → 200, accessToken in body, cookie set
[ ] 3.  GET  /profile (with token)         → 200, user data, no password/refreshToken
[ ] 4.  POST /refresh                      → 200, new accessToken, cookie rotated
[ ] 5.  POST /refresh (old rotated token)  → 401 "Refresh token revoked"
[ ] 6.  POST /logout (with token)          → 200, cookie cleared, DB hash null
[ ] 7.  POST /refresh after logout         → 401 "Refresh token missing/revoked"
[ ] 8.  GET  /profile after logout         → 200 (access token still valid <15min)
[ ] 9.  POST /refresh (no cookie)          → 401 "Refresh token missing"
[ ] 10. POST /refresh (bad token)          → 401 "Invalid or expired refresh token"
[ ] 11. POST /logout (no auth header)      → 401 "Access denied"
[ ] 12. POST /login again                  → 200, new session established
```

---

## MongoDB Atlas Checks

After each key action, verify the `refreshToken` field in the `users` collection:

| Action | refreshToken field in DB |
|--------|--------------------------|
| Before login | `null` |
| After login | bcrypt hash (`$2b$10$...`) |
| After /refresh | new bcrypt hash (different from login hash) |
| After /logout | `null` |
| After login again | new bcrypt hash |

---

## Error Reference

| Scenario | Status | Message |
|----------|--------|---------|
| No Authorization header on logout/profile | 401 | "Access denied" |
| Expired or tampered access token | 401 | "Invalid Token" |
| No refresh cookie sent | 401 | "Refresh token missing" |
| Refresh cookie has bad JWT (tampered) | 401 | "Invalid or expired refresh token" |
| Refresh token rotated or logged out | 401 | "Refresh token revoked" |
| Valid token but role not admin | 403 | "You are not authorized to perform this action" |
