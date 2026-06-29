// ============================================================
// controllers/product.controller.js — Phase 5
// ============================================================
// Handles HTTP requests for all product operations.
//
// Rule: Controllers stay thin.
//   - Read data from req (body, params, query)
//   - Call the service method
//   - Send the response
//   - No business logic, no DB queries here
//
// asyncHandler wraps every method so we don't need try-catch —
// any thrown error goes directly to the global error middleware.
// ============================================================

const productService  = require("../services/product.service");
const asyncHandler    = require("../utils/asyncHandler");
const ApiResponse     = require("../utils/ApiResponse");

const {
  createProductSchema,
  updateProductSchema,
} = require("../validators/product.validator");

class ProductController {

  // ── POST /api/products ────────────────────────────────────
  // Phase 5 — Create a new product (admin only — enforced in routes)
  // 1. Validate request body with Zod
  // 2. Pass validated data to service
  // 3. Return 201 with created product
  createProduct = asyncHandler(async (req, res) => {
    // Zod parse() validates and also strips unknown fields
    const validatedData = createProductSchema.parse(req.body);

    const product = await productService.createProduct(validatedData);

    res.status(201).json(new ApiResponse(201, "Product created successfully", product));
  });

  // ── GET /api/products ─────────────────────────────────────
  // Phase 5 (basic), Phase 6 (pagination), Phase 7 (search),
  // Phase 8 (filters), Phase 9 (sorting)
  //
  // req.query contains all the URL parameters:
  //   page, limit, search, category, brand, minPrice, maxPrice, sort
  // They are all passed directly to the service → repository
  getAllProducts = asyncHandler(async (req, res) => {
    const result = await productService.getAllProducts(req.query);

    res.status(200).json(new ApiResponse(200, "Products fetched successfully", result));
  });

  // ── GET /api/products/:id ─────────────────────────────────
  // Phase 5 — Get a single product by its MongoDB _id
  // req.params.id comes from the URL: /api/products/68554e...
  getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json(new ApiResponse(200, "Product fetched successfully", product));
  });

  // ── PUT /api/products/:id ─────────────────────────────────
  // Phase 5 — Update a product (admin only — enforced in routes)
  // updateProductSchema uses .partial() — all fields are optional
  // so you can send only { price: 999 } to update just the price
  updateProduct = asyncHandler(async (req, res) => {
    const validatedData = updateProductSchema.parse(req.body);

    const product = await productService.updateProduct(req.params.id, validatedData);

    res.status(200).json(new ApiResponse(200, "Product updated successfully", product));
  });

  // ── DELETE /api/products/:id ──────────────────────────────
  // Phase 5 — Delete a product (admin only — enforced in routes)
  // No response data needed — just confirm it was deleted
  deleteProduct = asyncHandler(async (req, res) => {
    await productService.deleteProduct(req.params.id);

    res.status(200).json(new ApiResponse(200, "Product deleted successfully"));
  });
}

module.exports = new ProductController();
