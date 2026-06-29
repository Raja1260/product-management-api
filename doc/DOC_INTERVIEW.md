# Interview Preparation — Concepts & Questions

Questions and answers for every concept used in this project.

---

## Architecture

**Q: What is MVC pattern?**
A: MVC stands for Model-View-Controller. In this API:
- **Model** — Mongoose schema (defines DB structure)
- **View** — JSON response (no HTML, it's an API)
- **Controller** — handles HTTP, calls service, sends response

**Q: What is the Repository Pattern?**
A: A pattern where all database operations are isolated into a single "repository" class. Controllers and services never write MongoDB queries — they call repository methods. This means if the database changes, only the repository needs updating.

**Q: What is the Service Layer?**
A: The layer that contains business logic — decisions and rules. Example: "A product with this name already exists — reject." Services call repositories for data, they never query the DB directly.

**Q: Why should controllers stay thin?**
A: Controllers handle HTTP concerns only — reading `req`, calling a service, sending `res`. Putting business logic in controllers makes it hard to test, reuse, and maintain.

**Q: What is the Single Responsibility Principle?**
A: Each module does exactly one thing. Repository handles DB. Service handles business rules. Controller handles HTTP. Validators handle input checking.

---

## Error Handling

**Q: What is ApiError and why is it used?**
A: A custom Error class that carries an HTTP status code. A plain `throw new Error("message")` only has a message. ApiError also carries a statusCode so the global error middleware can send the right HTTP status automatically.

**Q: What is asyncHandler?**
A: A wrapper for async controller functions. Without it, every async function needs its own try-catch block. asyncHandler catches any thrown error and passes it to `next()`, which triggers the global error middleware.

**Q: What is a global error middleware?**
A: A single function registered last in `app.js` with 4 parameters `(err, req, res, next)`. Express automatically routes any `next(error)` call to it. It sends a clean, consistent JSON error response.

**Q: Why is the error middleware registered last?**
A: Express processes middleware in order. If it is registered before routes, it will never receive route errors. It must come after all routes to catch errors from them.

---

## Validation

**Q: What is Zod?**
A: A schema validation library. You define the shape and rules for data, then call `.parse(req.body)`. If the data does not match, Zod throws a clear error automatically.

**Q: Why validate with both Zod and Mongoose?**
A: Zod runs at the API boundary and returns readable user-facing errors. Mongoose runs before the DB write as a last safety net. Two-layer protection.

**Q: What does `.partial()` do on a Zod schema?**
A: Makes every field in the schema optional. Used for the update endpoint so clients can send only the fields they want to change, like just `{ price: 999 }`.

---

## Pagination

**Q: What is pagination?**
A: Loading a fixed number of records per request instead of the entire dataset. Controlled by `page` and `limit` query parameters.

**Q: What is the purpose of `skip()`?**
A: Tells MongoDB to skip the first N documents. Used to jump to the correct page.

**Q: What is the purpose of `limit()`?**
A: Tells MongoDB to return at most N documents per query.

**Q: Explain the formula: `skip = (page - 1) * limit`**
A: Page 1 → skip 0 (start from beginning). Page 2, limit 5 → skip 5 (start from document 6). Page 3, limit 5 → skip 10.

**Q: Why do we use `countDocuments()`?**
A: To get the total number of matching documents so we can calculate `totalPages = Math.ceil(total / limit)`. The same filter must be passed to count only the filtered results.

**Q: Why use `Math.ceil()` for totalPages?**
A: If there are 11 products and limit is 5: 11/5 = 2.2. Math.ceil(2.2) = 3. We need 3 pages (2 full, 1 partial), not 2.

**Q: What are query parameters? Difference from req.params?**
A: `req.query` comes from the URL after `?`: `/products?page=2&limit=5`. `req.params` comes from the URL path: `/products/:id` → `req.params.id = "68554e..."`.

---

## Search

**Q: What is MongoDB `$regex`?**
A: A query operator that matches documents where a field matches a pattern. Like LIKE in SQL. Example: `{ name: { $regex: "iphone", $options: "i" } }`.

**Q: What does `$options: "i"` mean?**
A: Case-insensitive. So "iphone", "IPHONE", "iPhone" all match the same regex.

**Q: Why does pagination count use the same filter as the search?**
A: To count only matching results, not the total collection. Searching "iphone" and finding 5 results should show totalPages based on 5, not on 1000 total products.

---

## Filtering

**Q: What does `$gte` mean in MongoDB?**
A: Greater than or equal (>=). `{ price: { $gte: 20000 } }` returns products with price >= 20000.

**Q: What does `$lte` mean in MongoDB?**
A: Less than or equal (<=). Combined with `$gte` you get a price range.

**Q: How does the dynamic filter object work?**
A: We start with an empty `filter = {}` and add fields to it only when those query params are provided. If `category=Mobile` is in the query, `filter.category = "Mobile"` is added. MongoDB then uses this object to match documents.

---

## Sorting

**Q: How does the `-` prefix work in sorting?**
A: `?sort=price` → ascending. `?sort=-price` → descending. The `-` prefix is detected in code: if the sort string starts with `-`, use sort order `-1` (descending).

**Q: Why whitelist allowed sort fields?**
A: Without a whitelist, users could sort by any field including internal or sensitive ones. Validating against a known list prevents unexpected behavior.

**Q: What is a sort object in MongoDB?**
A: An object like `{ price: -1 }` or `{ name: 1 }`. `-1` means descending, `1` means ascending. Built dynamically and passed to `.sort()`.

---

## JWT Authentication

**Q: What is JWT?**
A: JSON Web Token. A string with three parts: header.payload.signature. The server signs it with a secret. Anyone can decode the payload, but only the server can create a valid signature.

**Q: What does the auth middleware do?**
A: Reads the `Authorization: Bearer <token>` header, calls `jwt.verify()` to check the signature and expiry, extracts the payload, and attaches it to `req.user`. Every protected controller can then read `req.user.id` and `req.user.role`.

**Q: What is bcrypt? Why is it used for passwords?**
A: A hashing algorithm with a built-in cost factor (saltRounds). `bcrypt.hash("123456", 10)` produces a hash like `$2b$10$...`. The higher the cost, the slower and harder to brute-force. `bcrypt.compare(plainText, hash)` checks if they match without decrypting.

**Q: Why use a generic error message for wrong email or password?**
A: "Invalid email or password" tells the attacker nothing. If you return "User not found" for a wrong email, they know which emails are registered. Combined error messages protect user privacy.

**Q: What payload should be put in a JWT?**
A: Only the minimum needed — typically `{ id, role }`. Never include the password or sensitive fields. The payload is base64-encoded, not encrypted — anyone can read it.

---

## RBAC

**Q: What is the difference between 401 and 403?**
A: 401 = not authenticated (no valid token). 403 = authenticated but not authorized (valid token, wrong role). A user with a valid token still gets 403 if they try an admin-only action.

**Q: How does authorize() work?**
A: It is a higher-order function that returns middleware. `authorize("admin")` returns a function that checks `req.user.role === "admin"`. It must run after `auth` middleware (which sets `req.user`).

**Q: Why must auth middleware run before authorize?**
A: `authorize` reads `req.user.role`. `req.user` is only set by `auth` middleware. If `auth` runs after `authorize`, `req.user` is undefined and the role check fails.

---

## Refresh Tokens

**Q: What is the problem with a single long-lived JWT?**
A: If stolen, the attacker has access until it expires (could be days). JWTs are stateless — there is no built-in way to revoke them without a DB check on every request.

**Q: What is the two-token solution?**
A: Access token (15 minutes) + Refresh token (7 days). Short access token = stolen copies expire quickly. Refresh token in httpOnly cookie = JavaScript cannot steal it via XSS.

**Q: What is an httpOnly cookie?**
A: A cookie with `httpOnly: true`. The browser sends it automatically on requests but JavaScript on the page cannot read it (`document.cookie` does not show it). XSS attacks cannot steal what JS cannot access.

**Q: What is token rotation?**
A: Every time `/refresh` is called, a new pair is issued and the old refresh token is invalidated. So if someone steals a refresh token, the real user's next refresh will rotate it, locking the attacker out.

**Q: Why store a hash of the refresh token, not the raw token?**
A: Same reason passwords are hashed. If the DB is compromised, attacker gets bcrypt hashes — not usable tokens.

**Q: Why use a separate JWT_REFRESH_SECRET?**
A: If the access token secret leaks, it cannot be used to forge refresh tokens. Separate secrets = separate security domains.

**Q: What does `select: false` do on a Mongoose field?**
A: The field is excluded from all query results by default. You must explicitly add `.select("+fieldName")` to get it. Prevents accidental exposure of sensitive data in API responses.

**Q: What happens when a user logs out?**
A: The stored refresh token hash in the DB is set to null. The httpOnly cookie is cleared from the browser. Even if someone has the old cookie, calling `/refresh` will fail because there is no hash to compare against.

**Q: What is CORS credentials: true?**
A: By default, browsers do not send cookies to a different domain. `credentials: true` in CORS config allows it. Required for the httpOnly refresh token cookie to be sent from the React frontend to the API.

---

## General Backend

**Q: What is the difference between `req.body`, `req.query`, and `req.params`?**

| Property | Source | Example |
|----------|--------|---------|
| `req.body` | JSON body | `{ "name": "iPhone" }` |
| `req.query` | URL query string | `?page=2&limit=5` |
| `req.params` | URL path param | `/products/:id` |

**Q: What is middleware in Express?**
A: A function with access to `req`, `res`, and `next`. It runs between the route and the controller. Examples: auth verification, logging, body parsing, error handling.

**Q: What does `next()` do?**
A: Passes control to the next middleware or route handler. `next(error)` skips to the error middleware.

**Q: Why use environment variables instead of hardcoding values?**
A: Secrets (JWT secret, DB password) must not be in code. Different environments (dev, staging, prod) need different values. `.env` files are excluded from version control via `.gitignore`.

**Q: What is the purpose of `timestamps: true` in Mongoose?**
A: Automatically adds `createdAt` and `updatedAt` fields to every document. No need to manage them manually.
