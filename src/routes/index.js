// ============================================================
// routes/index.js — Phase 2
// ============================================================
// The main router. Registered in app.js as app.use("/api", routes)
//
// Responsibilities:
//   - Health check route at GET /api
//   - Mounts product routes at /api/products
//
// User routes are mounted separately in app.js at /api/users
// because they were added later in Phase 10.
// ============================================================

const express = require("express");
const router  = express.Router();

const productRoutes = require("./product.routes");

// Health check — confirms the API is running
// GET /api → { success: true, message: "Product Management API Running" }
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Product Management API Running",
  });
});

// Mount all product routes under /api/products
// GET  /api/products
// POST /api/products
// etc.
router.use("/products", productRoutes);

module.exports = router;
