// ============================================================
// models/user.model.js — Phase 10 + Phase 12
// ============================================================
// Defines the User schema — how a user document is stored in MongoDB.
//
// Phase 10 added:
//   name, email, password, role, isActive fields
//
// Phase 12 added:
//   refreshToken field — stores a bcrypt HASH of the current refresh token
//   This is what enables server-side logout and token rotation.
// ============================================================

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Email used for login — must be unique across all users
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // stored as lowercase always
      trim: true,
    },

    // Hashed password — NEVER store plain text passwords
    // bcrypt.hash() is called in user.service.js before saving
    // Example stored value: $2b$10$ajkdh....
    password: {
      type: String,
      required: true,
    },

    // User role — controls what they can do (Phase 11 RBAC)
    // "user"  → can only view products
    // "admin" → can create, update, delete products
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    // Account status — can disable a user without deleting them
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Phase 12 Added ───────────────────────────────────────
    // Stores a bcrypt HASH of the currently valid refresh token.
    //
    // Why store a hash and not the raw token?
    //   Same reason passwords are hashed — if the DB is compromised,
    //   the attacker gets a hash, not a working token.
    //
    // Why select: false?
    //   This field is EXCLUDED from all normal queries by default.
    //   findById(), findByEmail() etc. will NOT return this field.
    //   It only comes back when explicitly requested with .select("+refreshToken").
    //   This prevents accidental exposure in API responses.
    //
    // Lifecycle:
    //   Login  → hash is saved here (setRefreshToken in repository)
    //   Refresh → hash is compared, then replaced with new hash (rotation)
    //   Logout → set to null (token revoked — can no longer refresh)
    //
    // Before Phase 12: this field did not exist
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },
  },

  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
