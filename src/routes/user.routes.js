// ============================================================
// routes/user.routes.js — Phase 10 + Phase 12
// ============================================================
// Defines all user authentication endpoints.
// Mounted in app.js at: app.use("/api/users", userRoutes)
//
// Phase 10 added:
//   POST /register  → create account
//   POST /login     → get access token
//   GET  /profile   → get logged-in user data (protected)
//
// Phase 12 added:
//   POST /refresh   → exchange refresh cookie for new access token
//   POST /logout    → revoke session (protected)
// ============================================================

const express = require("express");
const router  = express.Router();

const userController = require("../controllers/user.controller");
const auth           = require("../middlewares/auth.middleware");

// ── Phase 10 ─────────────────────────────────────────────

// Public — no token needed
// Validates body, hashes password, saves user
router.post("/register", userController.register);

// Public — no token needed
// Phase 10: returned one JWT
// Phase 12: returns accessToken in body + sets refreshToken httpOnly cookie
router.post("/login", userController.login);

// ── Phase 12 Added ───────────────────────────────────────

// Public — no access token needed (it's probably expired, that's why we're here)
// Reads the httpOnly refresh token cookie automatically sent by the browser
// Returns a new accessToken, sets a new refresh token cookie (rotation)
router.post("/refresh", userController.refresh);

// Protected — requires a valid access token
// Why does logout need auth?
//   We need req.user.id to know whose refresh token to clear from the DB.
//   Without auth middleware, req.user would be undefined.
router.post("/logout", auth, userController.logout);

// ── Phase 10 ─────────────────────────────────────────────

// Protected — requires a valid access token
// Returns the logged-in user's profile data
router.get("/profile", auth, userController.profile);

module.exports = router;
