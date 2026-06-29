// ============================================================
// services/user.service.js — Phase 10 + Phase 12
// ============================================================
// Contains all business logic for user authentication.
//
// Phase 10 added:
//   register() — hash password, check duplicate email, save user
//   login()    — verify password, issue a single JWT
//   getProfile() — fetch user by id (used by profile route)
//
// Phase 12 changes:
//   login()        — now issues TWO tokens (access + refresh) instead of one
//   issueTokens()  — NEW: extracted shared logic for generating token pair
//   refresh()      — NEW: rotates the refresh token and issues a new pair
//   logout()       — NEW: clears stored refresh token hash from DB
//
//   Also removed: the console.log(JWT_SECRET) that was in login()
//   That was a security issue — it was printing the secret to server logs.
// ============================================================

const bcrypt = require("bcrypt");

const userRepository = require("../repositories/user.repository");
const ApiError        = require("../utils/ApiError");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/token.utils");

class UserService {

  // ── Register ──────────────────────────────────────────────
  // Phase 10
  // 1. Check if email is already registered
  // 2. Hash the password with bcrypt (saltRounds = 10)
  // 3. Save the user to the database
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);

    if (existingUser) {
      throw new ApiError(400, "Email already registered");
    }

    // Hash the password before saving
    // bcrypt.hash("123456", 10) → "$2b$10$..."
    // The "10" is the cost factor — higher = slower = harder to brute-force
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password    = hashedPassword;

    const user = await userRepository.create(userData);

    // Return only safe fields — never return the password
    return {
      id:    user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
    };
  }

  // ── Issue Tokens — Phase 12 NEW ───────────────────────────
  // Extracted into its own method because both login() and refresh()
  // need to do the exact same steps:
  //   1. Generate access token (15 min)
  //   2. Generate refresh token (7 days)
  //   3. Hash the refresh token and save the hash to DB
  //
  // Why hash the refresh token before storing?
  //   Same reason passwords are hashed — if the DB is breached,
  //   attacker gets a hash, not a usable token.
  async issueTokens(user) {
    const accessToken  = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store the hash of the refresh token (not the raw token)
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await userRepository.setRefreshToken(user._id, hashedRefreshToken);

    return { accessToken, refreshToken };
  }

  // ── Login ─────────────────────────────────────────────────
  // Phase 10: issued one JWT
  // Phase 12: now issues access token + refresh token pair
  //
  // What changed in Phase 12:
  //   Before: const token = jwt.sign({ id, role }, JWT_SECRET, { expiresIn })
  //           return { token, user }
  //   After:  calls this.issueTokens(user) which returns { accessToken, refreshToken }
  //           return { accessToken, refreshToken, user }
  //
  //   Also removed: console.log(JWT_SECRET) — was a security leak
  async login(loginData) {
    const user = await userRepository.findByEmail(loginData.email);

    // Use a generic message for both "user not found" and "wrong password"
    // This prevents attackers from knowing whether the email exists
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Compare the plain text password with the stored bcrypt hash
    const isPasswordMatched = await bcrypt.compare(loginData.password, user.password);

    if (!isPasswordMatched) {
      throw new ApiError(401, "Invalid email or password");
    }

    // Issue a fresh access + refresh token pair
    const { accessToken, refreshToken } = await this.issueTokens(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    };
  }

  // ── Refresh — Phase 12 NEW ────────────────────────────────
  // Called when the client's access token expires (15 min).
  // Client sends the refresh token cookie → this method issues a new pair.
  //
  // Steps:
  //   1. Check the token exists
  //   2. Verify signature and expiry with JWT_REFRESH_SECRET
  //   3. Load the user + their stored refresh token hash from DB
  //   4. bcrypt.compare the incoming token against the stored hash
  //      If they don't match → old token reused after rotation → reject
  //   5. Issue a new pair (overwrites the old hash in DB — rotation)
  async refresh(incomingRefreshToken) {
    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token missing");
    }

    // Step 2: Verify the JWT signature and check expiry
    let decoded;
    try {
      decoded = verifyRefreshToken(incomingRefreshToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    // Step 3: Load user WITH their stored refresh token hash
    // Normal findById() won't return the refreshToken field (select: false)
    const user = await userRepository.findByIdWithRefreshToken(decoded.id);

    if (!user || !user.refreshToken) {
      // No hash stored → user logged out or never logged in
      throw new ApiError(401, "Refresh token revoked");
    }

    // Step 4: Compare incoming token against stored hash
    const isMatch = await bcrypt.compare(incomingRefreshToken, user.refreshToken);

    if (!isMatch) {
      // Hash doesn't match → this token was already rotated
      // Someone is trying to reuse an old refresh token
      throw new ApiError(401, "Refresh token revoked");
    }

    // Step 5: Issue new pair (old hash is overwritten → rotation complete)
    const { accessToken, refreshToken } = await this.issueTokens(user);

    return { accessToken, refreshToken };
  }

  // ── Logout — Phase 12 NEW ────────────────────────────────
  // Clears the stored refresh token hash from the database.
  //
  // After this, even if someone has the old refresh token cookie:
  //   refresh() will load the user and find refreshToken = null
  //   → "Refresh token revoked" → 401
  //
  // This is true server-side session revocation.
  async logout(userId) {
    await userRepository.clearRefreshToken(userId);
  }

  // ── Get Profile ───────────────────────────────────────────
  // Phase 10
  // Returns the user document (password excluded by repository)
  async getProfile(id) {
    const user = await userRepository.findById(id);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return user;
  }
}

module.exports = new UserService();
