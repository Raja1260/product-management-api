// ============================================================
// routes/product.routes.js — Phase 5 + Phase 11
// ============================================================
// Defines all product API endpoints.
//
// Phase 5  → all 5 CRUD routes created (no auth yet)
// Phase 11 → auth + authorize("admin") added to write routes
//
// Route protection pattern (Phase 11):
//   auth            → verifies JWT, sets req.user
//   authorize("admin") → checks req.user.role === "admin"
//   Both must pass before the controller runs.
//
// Access rules:
//   GET routes    → public, no token needed
//   Write routes  → must be logged in AND must be admin
// ============================================================

const express = require("express");
const router  = express.Router();

const auth           = require("../middlewares/auth.middleware");
const authorize      = require("../middlewares/role.middleware");
const productController = require("../controllers/product.controller");

// ── Public Routes — Phase 5 ───────────────────────────────
// Anyone (guest, user, admin) can view products
// No token required
router.get("/",    productController.getAllProducts);
router.get("/:id", productController.getProductById);

// ── Protected Admin Routes — Phase 5 + Phase 11 ──────────
// Phase 5:  routes existed but had no auth
// Phase 11: auth + authorize("admin") added
//
// Request flow:
//   Client → auth middleware → authorize middleware → controller
//
// If no token:           401 Unauthorized  (auth middleware)
// If token but not admin: 403 Forbidden    (authorize middleware)
// If token and admin:     controller runs  ✅

router.post(
  "/",
  auth,
  authorize("admin"),
  productController.createProduct
);

router.put(
  "/:id",
  auth,
  authorize("admin"),
  productController.updateProduct
);

router.delete(
  "/:id",
  auth,
  authorize("admin"),
  productController.deleteProduct
);

module.exports = router;
