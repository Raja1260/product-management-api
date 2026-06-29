// ============================================================
// utils/token.utils.js — Phase 12 (NEW FILE)
// ============================================================
// Centralized helpers for generating and verifying JWTs.
//
// Why this file was created in Phase 12:
//   Before Phase 12, this file was EMPTY (0 bytes).
//   All JWT signing was done directly inside user.service.js:
//
//     const token = jwt.sign(
//       { id: user._id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN }
//     );
//
//   Phase 12 introduced TWO tokens (access + refresh),
//   each with different secrets and expiry times.
//   Putting all of that in the service would make it messy.
//   So we moved all token logic here.
//
// Two Token System (Phase 12):
//   Access Token  — short-lived (15 minutes)
//                   sent with every API request in Authorization header
//                   if stolen, it expires in 15 minutes automatically
//
//   Refresh Token — long-lived (7 days)
//                   only sent to /refresh and /logout endpoints
//                   stored as httpOnly cookie (JavaScript cannot read it)
//                   used to get a new access token when it expires
//
// Why two DIFFERENT secrets?
//   If only one secret was used, a stolen access token could be used
//   to forge a refresh token. Separate secrets prevent that entirely.
// ============================================================

const jwt = require("jsonwebtoken");

// ── Payload ─────────────────────────────────────────────────
// The data we put INSIDE the token.
// Keep it minimal — only what auth middleware actually needs.
// Never put the password or sensitive data in a token payload.
const buildPayload = (user) => ({
  id: user._id,
  role: user.role,
});

// ── Generate Access Token ────────────────────────────────────
// Signs with JWT_SECRET, expires in JWT_EXPIRES_IN (15 minutes)
// Returned in the login response body — client stores it in memory
const generateAccessToken = (user) => {
  return jwt.sign(buildPayload(user), process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// ── Generate Refresh Token ───────────────────────────────────
// Signs with JWT_REFRESH_SECRET (different secret), expires in 7 days
// Sent as httpOnly cookie — client cannot read or steal it via JavaScript
const generateRefreshToken = (user) => {
  return jwt.sign(buildPayload(user), process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

// ── Verify Access Token ──────────────────────────────────────
// Used in auth.middleware.js on every protected request
// Throws an error if token is expired or tampered with
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// ── Verify Refresh Token ─────────────────────────────────────
// Used in user.service.js refresh() method
// Uses JWT_REFRESH_SECRET — an access token passed here will be REJECTED
// because it was signed with a different secret
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
