// ============================================================
// validators/user.validator.js — Phase 10
// ============================================================
// Validates incoming registration and login data using Zod.
//
// Why validate before the service?
//   If someone sends { email: "notanemail", password: "12" },
//   Zod rejects it immediately with a clear error message
//   before any DB query or bcrypt operation happens.
// ============================================================

const { z } = require("zod");

// ── Register Schema ───────────────────────────────────────────
// Validates the body of POST /api/users/register
const registerSchema = z.object({
  // Name: 3–50 characters
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  // Email: must be a valid email format
  email: z.string().trim().email("Please enter a valid email address"),

  // Password: 6–20 characters
  // Note: the actual hashing happens in user.service.js with bcrypt
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(20, "Password cannot exceed 20 characters"),
});

// ── Login Schema ──────────────────────────────────────────────
// Validates the body of POST /api/users/login
// Simpler than register — only email and password needed
const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),

  password: z.string().min(6, "Password must be at least 6 characters"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
