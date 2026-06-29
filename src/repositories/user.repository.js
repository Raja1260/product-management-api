// ============================================================
// repositories/user.repository.js — Phase 10 + Phase 12
// ============================================================
// Handles all database operations for the User collection.
// The service layer NEVER writes MongoDB queries directly —
// all DB access goes through this repository.
//
// Phase 10 added:
//   create, findByEmail, findById
//
// Phase 12 added:
//   findByIdWithRefreshToken, setRefreshToken, clearRefreshToken
//   These three methods are needed for refresh token rotation and logout.
// ============================================================

const User = require("../models/user.model");

class UserRepository {
  // ── Phase 10 ─────────────────────────────────────────────

  // Save a new user to the database
  // Called from user.service.js → register()
  async create(userData) {
    return await User.create(userData);
  }

  // Find a user by email — used for login and duplicate check on register
  async findByEmail(email) {
    return await User.findOne({ email });
  }

  // Find a user by MongoDB _id — used for profile route
  // .select("-password") removes the password field from the result
  // so it is never sent back in a response
  async findById(id) {
    return await User.findById(id).select("-password");
  }

  // ── Phase 12 Added ───────────────────────────────────────

  // Find user by id AND include the refreshToken field
  //
  // Why a separate method?
  //   refreshToken has `select: false` in the schema.
  //   A normal findById() call returns undefined for that field
  //   even if a value is stored in the DB.
  //   .select("+refreshToken") explicitly opts it back in.
  //
  // Used in: user.service.js → refresh()
  async findByIdWithRefreshToken(id) {
    return await User.findById(id).select("+refreshToken");
  }

  // Save the bcrypt hash of the new refresh token
  //
  // Called after every login and every token refresh (rotation).
  // Each login/refresh overwrites the previous hash,
  // so only ONE refresh token is valid at any time per user.
  //
  // Used in: user.service.js → issueTokens()
  async setRefreshToken(id, hashedToken) {
    return await User.findByIdAndUpdate(id, { refreshToken: hashedToken });
  }

  // Set refreshToken to null — invalidates the session
  //
  // After this, even if someone has the old refresh token cookie,
  // the bcrypt.compare in refresh() will fail (nothing to compare against).
  // This is true server-side logout.
  //
  // Used in: user.service.js → logout()
  async clearRefreshToken(id) {
    return await User.findByIdAndUpdate(id, { refreshToken: null });
  }
}

module.exports = new UserRepository();
