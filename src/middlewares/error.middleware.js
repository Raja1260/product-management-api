// ============================================================
// middlewares/error.middleware.js — Phase 4
// ============================================================
// Global error handler for the entire application.
//
// How it works:
//   When any controller or service throws an error,
//   asyncHandler catches it and calls next(error).
//   Express sees 4 parameters (err, req, res, next)
//   and automatically routes to this middleware.
//
// Why one central error handler?
//   Without it, you would write try-catch + res.json in every controller.
//   With it, errors from anywhere in the app land here
//   and get a clean, consistent JSON response.
//
// IMPORTANT: Must be registered LAST in app.js
//   app.use(errorMiddleware) — must come after all routes
// ============================================================

const errorMiddleware = (err, req, res, next) => {
  // Use the statusCode from ApiError if available, else 500
  // Example: ApiError(404, "Not found") → sends 404
  // Example: unexpected crash → sends 500
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    timestamp: new Date().toISOString(),
  });
};

module.exports = errorMiddleware;
