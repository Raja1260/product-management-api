// ============================================================
// middlewares/auth.middleware.js — Phase 10
// ============================================================
// Verifies the JWT access token on every protected route.
//
// How it works:
//   1. Client sends: Authorization: Bearer <accessToken>
//   2. This middleware reads that header
//   3. Verifies the token signature and expiry
//   4. Attaches decoded payload to req.user
//   5. Calls next() to continue to the controller
//
// If token is missing or invalid → throws 401 Unauthorized
//
// After Phase 12:
//   Access tokens expire in 15 minutes (was 7 days before).
//   When the client gets a 401, it should call POST /api/users/refresh
//   to get a new access token using the httpOnly refresh cookie.
//
// Usage in routes:
//   router.get("/profile", auth, userController.profile)
//   router.post("/products", auth, authorize("admin"), ...)
// ============================================================

const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");

module.exports = (req, res, next) => {
  // Read the Authorization header
  // Expected format: "Bearer eyJhbGci..."
  const authHeader = req.headers.authorization;

  // If header is missing or does not start with "Bearer "
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Access denied"));
  }

  // Extract the token (everything after "Bearer ")
  const token = authHeader.split(" ")[1];

  try {
    // Verify signature and expiry using the access token secret
    // If expired or tampered → throws an error → caught below
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload to req.user
    // decoded = { id: "...", role: "admin", iat: ..., exp: ... }
    // Controllers and role middleware use req.user.id and req.user.role
    req.user = decoded;

    next();
  } catch {
    // Token is expired, malformed, or signed with wrong secret
    next(new ApiError(401, "Invalid Token"));
  }
};
