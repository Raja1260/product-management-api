// ============================================================
// services/product.service.js — Phase 3, 5
// ============================================================
// Contains all business logic for products.
//
// Rule: Service talks to Repository, never to MongoDB directly.
//       Controllers talk to Service, never to Repository directly.
//
// Business logic examples here:
//   - Duplicate product check before creating
//   - Product existence check before update/delete
//
// Phase 3 → class and method skeletons created
// Phase 5 → full CRUD logic implemented
// ============================================================

const productRepository = require("../repositories/product.repository");
const ApiError          = require("../utils/ApiError");

class ProductService {

  // ── Create Product ────────────────────────────────────────
  // Business rule: no two products can have the same name
  async createProduct(productData) {
    // Check if a product with this name already exists
    const existingProduct = await productRepository.findByName(productData.name);

    if (existingProduct) {
      // Throw a 400 error — the request is valid but violates business rules
      throw new ApiError(400, "Product with this name already exists");
    }

    // No duplicate found — save the product
    return await productRepository.create(productData);
  }

  // ── Get All Products ──────────────────────────────────────
  // Passes query params (page, limit, search, filters, sort) to repository
  // Returns both products array and pagination metadata
  //
  // Note: returning an empty array is NOT an error.
  // We never throw "Product not found" here — an empty list is valid.
  async getAllProducts(query) {
    return await productRepository.findAll(query);
  }

  // ── Get Product By ID ─────────────────────────────────────
  // Business rule: if the product doesn't exist, throw 404
  async getProductById(id) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  // ── Update Product ────────────────────────────────────────
  // Business rule: if product doesn't exist, throw 404
  async updateProduct(id, updateData) {
    const product = await productRepository.updateById(id, updateData);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }

  // ── Delete Product ────────────────────────────────────────
  // Business rule: if product doesn't exist, throw 404
  async deleteProduct(id) {
    const product = await productRepository.deleteById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return product;
  }
}

module.exports = new ProductService();
