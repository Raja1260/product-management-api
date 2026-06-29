# Backend Notes — Concepts & Patterns

Reference guide for every concept used in this project.

---

## Architecture — MVC + Repository Pattern

```
Client
  │
  ▼
Routes          → map URL to controller
  │
  ▼
Controller      → read request, call service, send response
  │
  ▼
Service         → business logic and decisions
  │
  ▼
Repository      → all database queries
  │
  ▼
MongoDB
```

### Layer Rules

| Layer | Does | Does NOT |
|-------|------|----------|
| Controller | Read req, call service, send res | Business logic, DB queries |
| Service | Business rules, decisions | DB queries, HTTP handling |
| Repository | MongoDB queries | Business logic, validation |
| Model | Define schema | Query data |
| Validator | Zod validation on input | Business logic |

---

## Request Lifecycle

```
Incoming Request
  │
  ▼
Global Middlewares (helmet, cors, morgan, json parser, cookieParser)
  │
  ▼
Route Matching
  │
  ▼
Route-specific Middlewares (auth, authorize)
  │
  ▼
Controller (reads req, calls service)
  │
  ▼
Service (runs business rules, calls repository)
  │
  ▼
Repository (runs MongoDB query)
  │
  ▼
Response sent back via res.json()
  │
  ▼
If any step throws → asyncHandler catches → next(error) → error.middleware.js
```

---

## Error Handling (Phase 4)

### ApiError
Custom Error class. Carries HTTP status code alongside the message.

```javascript
throw new ApiError(404, "Product not found")
throw new ApiError(400, "Email already registered")
throw new ApiError(401, "Invalid token")
```

Without ApiError, every error is a generic 500. With it, errors carry the right HTTP status automatically.

### ApiResponse
Standard success response wrapper.

```javascript
res.status(200).json(new ApiResponse(200, "Products fetched", data))
```

Every successful response in the app looks the same:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { ... },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

### asyncHandler
Wraps async controller functions. Catches any thrown error and passes it to `next()`, which triggers the global error middleware.

```javascript
// Without asyncHandler — repeat try-catch in every controller
createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body)
    res.json(product)
  } catch (error) {
    next(error)
  }
}

// With asyncHandler — no try-catch needed
createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body)
  res.json(product)
})
```

### Global Error Middleware
Registered last in `app.js`. Receives any `next(error)` call from anywhere in the app.

```javascript
// Must have 4 parameters — Express identifies it as error middleware
const errorMiddleware = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  })
}
```

---

## Validation — Zod (Phase 3)

Zod validates incoming request data before it reaches the service or database.

```javascript
const createProductSchema = z.object({
  name:  z.string().min(3).max(100),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  image: z.string().url().optional()
})

// In controller:
const validatedData = createProductSchema.parse(req.body)
// parse() throws ZodError automatically if invalid — caught by asyncHandler
```

### Why Validate Twice? (Zod + Mongoose)
- **Zod** — runs at API entry, returns clean user-friendly errors like "Price cannot be negative"
- **Mongoose** — runs before DB write, final safety net

### Partial Schema for Updates
```javascript
// createProductSchema with .partial() makes every field optional
// So PUT /api/products/:id can accept just { price: 999 }
updateProductSchema: createProductSchema.partial()
```

---

## Pagination (Phase 6)

Loads a page of results instead of all documents.

### Query Parameters
```
GET /api/products?page=2&limit=5
```

### Formula
```javascript
skip = (page - 1) * limit
// page 2, limit 5 → skip 5 → start from document 6
```

### MongoDB Methods
```javascript
Product.find(filter)
  .skip(skip)    // skip N documents
  .limit(limit)  // return max N documents

// Count documents matching the same filter (not total collection size)
const totalProducts = await Product.countDocuments(filter)
const totalPages    = Math.ceil(totalProducts / limit)
```

### Metadata Returned
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

---

## Search (Phase 7)

Case-insensitive text search on product names.

### Query Parameter
```
GET /api/products?search=iphone
```

### MongoDB Implementation
```javascript
filter.name = {
  $regex:   search,  // search as a pattern
  $options: "i"      // "i" = case-insensitive
}
// "iphone", "IPHONE", "iPhone" all match
```

---

## Filtering (Phase 8)

### Query Parameters
```
?category=Mobile
?brand=Apple
?minPrice=20000
?maxPrice=80000
?minPrice=20000&maxPrice=80000
```

### MongoDB Implementation
```javascript
if (category)           filter.category = category
if (brand)              filter.brand = brand
if (minPrice || maxPrice) {
  filter.price = {}
  if (minPrice) filter.price.$gte = Number(minPrice)  // >= minPrice
  if (maxPrice) filter.price.$lte = Number(maxPrice)  // <= maxPrice
}
```

### MongoDB Comparison Operators
| Operator | Meaning |
|----------|---------|
| `$gte` | Greater than or equal (>=) |
| `$lte` | Less than or equal (<=) |
| `$gt` | Greater than (>) |
| `$lt` | Less than (<) |

---

## Sorting (Phase 9)

### Query Parameter
```
?sort=price     → ascending
?sort=-price    → descending (prefix - means desc)
?sort=name      → A to Z
?sort=-createdAt → newest first (default)
```

### Allowed Fields
`price`, `name`, `createdAt`, `stock`, `brand`, `category`

Any other field falls back to `-createdAt`.

### MongoDB Implementation
```javascript
const sortOption = {}
sortOption[sortField] = sortOrder  // -1 = desc, 1 = asc
// Example: { price: -1 }

Product.find(filter).sort(sortOption).skip(skip).limit(limit)
```

### Why Whitelist Fields?
Without a whitelist, a user could sort by any field including internal ones. Whitelist prevents unexpected behavior.

---

## Authentication — JWT (Phase 10)

### Registration Flow
```
POST /api/users/register
  │
  ▼
Zod validates name, email, password
  │
  ▼
Service checks if email already exists → 400 if duplicate
  │
  ▼
bcrypt.hash(password, 10) → "$2b$10$..."
  │
  ▼
Save user to DB (hashed password, role: "user" by default)
```

### Login Flow
```
POST /api/users/login
  │
  ▼
Find user by email → 401 if not found
  │
  ▼
bcrypt.compare(plainPassword, hashedPassword) → 401 if mismatch
  │
  ▼
Phase 10: jwt.sign({ id, role }, JWT_SECRET, { expiresIn })
Phase 12: issueTokens(user) → access token + refresh token
```

### Auth Middleware
```javascript
// Reads Authorization: Bearer <token>
// jwt.verify(token, JWT_SECRET) → decoded = { id, role }
// req.user = decoded
// next()
```

Any protected route uses this middleware. The controller can access `req.user.id` and `req.user.role`.

### Why Not Store Passwords in Plain Text?
If the database is breached, plain passwords expose all users. bcrypt hashes are computationally expensive to reverse.

---

## Authorization — RBAC (Phase 11)

### Authentication vs Authorization
- Authentication: WHO are you? (verified by token)
- Authorization: WHAT can you do? (verified by role)

### authorize() Middleware
```javascript
// Used in routes after auth middleware
router.post("/", auth, authorize("admin"), controller)

// auth sets req.user
// authorize checks req.user.role against allowed roles
```

### HTTP Status Codes
- **401 Unauthorized** — no token sent, or token invalid/expired
- **403 Forbidden** — token valid, but role not permitted

---

## Refresh Token System (Phase 12)

### Why Two Tokens?
| Problem | Solution |
|---------|---------|
| Long-lived single token: if stolen, attacker has access for days | Short-lived access token: stolen copies expire in 15 minutes |
| Can't revoke a JWT without DB check on every request | Refresh token stored in DB: null it to revoke instantly |
| Single secret: one leak compromises everything | Two secrets: separate signing keys for each token type |

### Access Token
- Expiry: 15 minutes
- Sent with every API request in `Authorization: Bearer` header
- If stolen: useless in 15 minutes
- Stored: client memory (not localStorage, not a cookie)

### Refresh Token
- Expiry: 7 days
- Sent only to `/api/users/refresh` and `/api/users/logout`
- Sent via httpOnly cookie — JS cannot read it
- Stored in DB as a bcrypt hash

### httpOnly Cookie Explained
```javascript
res.cookie("refreshToken", token, {
  httpOnly: true,  // JS cannot read: document.cookie won't show it
  secure: true,    // HTTPS only in production
  sameSite: "strict" // not sent on cross-site requests (CSRF protection)
})
```

An XSS attacker cannot steal what JavaScript cannot read.

### Token Rotation
Every `/refresh` call issues a new pair and overwrites the stored hash. The old refresh token is immediately invalid.

If an attacker steals a refresh token but the real user refreshes first:
- New hash is stored in DB
- Attacker's token no longer matches the hash
- Attacker is locked out

### Server-Side Logout
```javascript
// Logout sets DB field to null
User.findByIdAndUpdate(id, { refreshToken: null })
```

After this, even a valid, non-expired refresh token is rejected because there is no hash to compare against. This is true session revocation.

### Why Store a Hash, Not the Raw Token?
Same reason passwords are hashed. If the DB is compromised, the attacker gets bcrypt hashes — not working tokens.

### Token Flow
```
Login → issue access token (15m) + refresh token (7d)
         → access token in JSON response body
         → refresh token in httpOnly cookie

Every API call → Authorization: Bearer <accessToken>

Access expires → POST /api/users/refresh
                 → browser sends cookie automatically
                 → verify token → compare hash → issue new pair
                 → new access token in body
                 → new refresh token cookie (old one invalidated)

Logout → POST /api/users/logout (with valid access token)
       → DB hash set to null
       → cookie cleared
       → session fully revoked
```

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://...

# Access token (short-lived)
JWT_SECRET=your_access_secret
JWT_EXPIRES_IN=15m

# Refresh token (long-lived, separate secret)
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
```

---

## req Object Reference

| Property | Where It Comes From | Example |
|----------|-------------------|---------|
| `req.body` | JSON body parser | `{ name: "iPhone" }` |
| `req.params` | URL path | `/products/:id` → `req.params.id` |
| `req.query` | URL query string | `?page=2` → `req.query.page` |
| `req.headers` | Request headers | `Authorization: Bearer ...` |
| `req.cookies` | cookie-parser middleware | `req.cookies.refreshToken` |
| `req.user` | auth.middleware.js | `{ id: "...", role: "admin" }` |
