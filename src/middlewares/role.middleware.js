// ============================================================
// middlewares/role.middleware.js — Phase 11
// ============================================================
// Handles Role-Based Access Control (RBAC).
//
// Authentication (Phase 10) answers: WHO are you?
// Authorization (Phase 11) answers: WHAT are you allowed to do?
//
// How it works:
//   authorize("admin") returns a middleware function.
//   That middleware checks req.user.role (set by auth.middleware.js).
//   If the role is not in the allowed list → 403 Forbidden.
//
// Always used AFTER auth middleware in routes:
//   router.post("/", auth, authorize("admin"), controller)
//   auth runs first (sets req.user), then authorize checks the role.
//
// Role matrix:
//   Guest (no token) → can only view products (GET)
//   User (token)     → can view products, cannot create/update/delete
//   Admin (token)    → full access to all product operations
// ============================================================

const ApiError = require("../utils/ApiError");

const authorize = (...allowedRoles) => {
  // Returns a middleware function
  // allowedRoles example: ["admin"] or ["admin", "manager"]
  return (req, res, next) => {
    // req.user is set by auth.middleware.js
    // If somehow authorize is used without auth middleware before it
    if (!req.user) {
      return next(new ApiError(401, "Authentication required"));
    }

    // Check if the user's role is in the allowed list
    // Example: allowedRoles = ["admin"], req.user.role = "user" → denied
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, "You are not authorized to perform this action")
      );
    }

    // Role matched — allow the request to continue
    next();
  };
};

module.exports = authorize;
