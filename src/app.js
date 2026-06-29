// ============================================================
// app.js — Phase 2 + Phase 12 (cookie-parser added)
// ============================================================
// Sets up the Express application.
// Does NOT start the server — that is server.js's job.
//
// Responsibilities:
//   1. Add security middlewares (helmet, cors)
//   2. Add logging (morgan)
//   3. Parse incoming request body (JSON + URL encoded)
//   4. Parse cookies — ADDED in Phase 12
//   5. Register all routes
//   6. Register global error handler (always last)
// ============================================================

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Phase 12: Added cookie-parser to read httpOnly refresh token cookie
// Before Phase 12: this line did not exist
// Why: req.cookies is only available after cookie-parser middleware runs
const cookieParser = require("cookie-parser");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const userRoutes = require("./routes/user.routes");

const app = express();

// ── Security ────────────────────────────────────────────────
// helmet adds secure HTTP headers automatically
// Example: X-Content-Type-Options, X-Frame-Options, etc.
app.use(helmet());

// ── CORS ────────────────────────────────────────────────────
// Allows the React frontend (different domain/port) to call this API
//
// Phase 12 change:
//   Before: app.use(cors())
//   After:  app.use(cors({ credentials: true, origin: ... }))
//
// Why credentials: true?
//   The browser will NOT send cookies (like the refresh token cookie)
//   to another domain unless CORS explicitly allows credentials.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || true,
    credentials: true,
  })
);

// ── Logging ─────────────────────────────────────────────────
// morgan logs every HTTP request to the terminal
// "dev" format: GET /api/products 200 12ms
app.use(morgan("dev"));

// ── Body Parsers ─────────────────────────────────────────────
// Parse JSON body: {"name":"iPhone"}
app.use(express.json());

// Parse URL-encoded body: name=iPhone&price=89999
app.use(express.urlencoded({ extended: true }));

// ── Cookie Parser — Phase 12 Added ───────────────────────────
// Parses cookies from the incoming request headers
// and makes them available on req.cookies
//
// Example:
//   req.cookies.refreshToken  → the httpOnly refresh token
//
// Before Phase 12: this line did not exist
//   req.cookies was undefined — refresh token could not be read
// After Phase 12: req.cookies is populated automatically
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────
// /api        → product routes (Phase 3)
// /api/users  → user auth routes (Phase 10)
app.use("/api", routes);
app.use("/api/users", userRoutes);

// ── Global Error Handler ─────────────────────────────────────
// Must be registered LAST
// Catches any error thrown in controllers/services
// and sends a clean JSON error response (Phase 4)
app.use(errorMiddleware);

module.exports = app;
