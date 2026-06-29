// ============================================================
// controllers/user.controller.js — Phase 10 + Phase 12
// ============================================================
// Handles HTTP requests for all user auth operations.
//
// Phase 10 added:
//   register, login, profile
//
// Phase 12 added:
//   refresh, logout
//   Cookie handling for the refresh token
//
// Why httpOnly cookie for the refresh token?
//   An httpOnly cookie cannot be read by JavaScript on the frontend.
//   This means even if the site has an XSS vulnerability,
//   the attacker's script cannot steal the refresh token.
//   The access token (short-lived, 15 min) is in the response body.
// ============================================================

const userService  = require("../services/user.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiResponse  = require("../utils/ApiResponse");

const {
  registerSchema,
  loginSchema,
} = require("../validators/user.validator");

// ── Phase 12: Cookie configuration ───────────────────────────
// These options are used for both setting and clearing the cookie.
// Defined once here so they are consistent across login, refresh, logout.
//
// httpOnly: true   → JavaScript cannot read this cookie (XSS protection)
// secure: true     → cookie only sent over HTTPS (in production)
// sameSite: strict → cookie not sent on cross-site requests (CSRF protection)
// maxAge           → 7 days in milliseconds (matches JWT_REFRESH_EXPIRES_IN)
const REFRESH_COOKIE_NAME = "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge:   7 * 24 * 60 * 60 * 1000,
};

class UserController {

  // ── POST /api/users/register — Phase 10 ──────────────────
  // 1. Validate request body with Zod
  // 2. Pass to service (checks duplicate, hashes password, saves user)
  // 3. Return 201 with safe user data (no password)
  register = asyncHandler(async (req, res) => {
    const validatedData = registerSchema.parse(req.body);

    const user = await userService.register(validatedData);

    res.status(201).json(new ApiResponse(201, "User registered successfully", user));
  });

  // ── POST /api/users/login — Phase 10 + Phase 12 ──────────
  // Phase 10: returned a single JWT in the response body
  // Phase 12: now returns accessToken in body + sets refreshToken as cookie
  //
  // What changed:
  //   Before: res.json({ token, user })
  //   After:
  //     res.cookie("refreshToken", refreshToken, cookieOptions)  ← Phase 12
  //     res.json({ accessToken, user })                          ← Phase 12
  //
  // The refresh token NEVER appears in the JSON response body.
  // It travels only via the httpOnly cookie.
  login = asyncHandler(async (req, res) => {
    const validatedData = loginSchema.parse(req.body);

    const { accessToken, refreshToken, user } = await userService.login(validatedData);

    // Set the refresh token as an httpOnly cookie
    // Browser will automatically send this cookie on future requests
    // to /api/users/refresh and /api/users/logout
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    res.status(200).json(
      new ApiResponse(200, "Login successful", { accessToken, user })
    );
  });

  // ── POST /api/users/refresh — Phase 12 NEW ───────────────
  // Called when the access token expires (every 15 minutes).
  // The browser automatically sends the httpOnly cookie with this request.
  //
  // 1. Read refresh token from cookie (req.cookies set by cookie-parser)
  // 2. Service verifies it, checks DB hash, issues new pair
  // 3. Set new refresh token cookie (rotation — old one is now invalid)
  // 4. Return new access token in JSON response body
  refresh = asyncHandler(async (req, res) => {
    // cookie-parser makes req.cookies available (wired in app.js Phase 12)
    const incomingRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

    const { accessToken, refreshToken } = await userService.refresh(incomingRefreshToken);

    // Rotation: replace the old cookie with the new refresh token
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions);

    res.status(200).json(
      new ApiResponse(200, "Token refreshed successfully", { accessToken })
    );
  });

  // ── POST /api/users/logout — Phase 12 NEW ────────────────
  // 1. Clear the refresh token hash from DB (server-side revocation)
  // 2. Clear the httpOnly cookie from the browser
  //
  // After logout, even if someone has the old cookie:
  //   The DB hash is null → refresh() will reject it → 401
  // This is true server-side logout.
  //
  // Requires auth middleware (needs req.user.id to know WHO is logging out)
  logout = asyncHandler(async (req, res) => {
    // req.user.id is set by auth.middleware.js
    await userService.logout(req.user.id);

    // Remove the cookie from the browser
    res.clearCookie(REFRESH_COOKIE_NAME, refreshCookieOptions);

    res.status(200).json(new ApiResponse(200, "Logged out successfully"));
  });

  // ── GET /api/users/profile — Phase 10 ────────────────────
  // Returns the logged-in user's data.
  // req.user.id is set by auth.middleware.js after verifying the access token.
  profile = asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user.id);

    res.status(200).json(new ApiResponse(200, "Profile fetched successfully", user));
  });
}

module.exports = new UserController();
