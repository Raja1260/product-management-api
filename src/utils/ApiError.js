// ============================================================
// utils/ApiError.js — Phase 4
// ============================================================
// A custom Error class for throwing clean API errors.
//
// Why not use plain `throw new Error("message")`?
//   A plain Error only has a message.
//   ApiError also carries a statusCode (400, 401, 404, etc.)
//   so the global error middleware can send the right HTTP status.
//
// Usage anywhere in service or middleware:
//   throw new ApiError(404, "Product not found")
//   throw new ApiError(401, "Invalid token")
// ============================================================

class ApiError extends Error {
  constructor(statusCode, message) {
    // Call the built-in Error constructor with the message
    // This sets this.message and the stack trace
    super(message);

    // HTTP status code to send in the response
    this.statusCode = statusCode;

    // Always false for errors — used by the error middleware
    this.success = false;

    // Captures where the error was thrown for better stack traces
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
