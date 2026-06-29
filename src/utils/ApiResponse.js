// ============================================================
// utils/ApiResponse.js — Phase 4
// ============================================================
// A standard response wrapper for all successful API responses.
//
// Why use this?
//   Without it, every controller sends its own shaped response.
//   With it, every successful response always looks the same:
//   { success, statusCode, message, data, timestamp }
//
// Usage in controllers:
//   res.status(200).json(new ApiResponse(200, "Success", data))
//   res.status(201).json(new ApiResponse(201, "Created", product))
// ============================================================

class ApiResponse {
  constructor(statusCode, message, data = null) {
    // Always true for successful responses
    this.success = true;

    // HTTP status code (200, 201, etc.)
    this.statusCode = statusCode;

    // Human-readable message describing what happened
    this.message = message;

    // The actual response payload (product, user, list, etc.)
    // Defaults to null if no data is passed (e.g. logout)
    this.data = data;

    // Timestamp so the client knows exactly when the response was sent
    this.timestamp = new Date().toISOString();
  }
}

module.exports = ApiResponse;
