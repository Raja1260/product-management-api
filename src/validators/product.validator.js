// ============================================================
// validators/product.validator.js — Phase 3
// ============================================================
// Validates incoming product data using Zod before it reaches
// the service or database layer.
//
// Why validate at the API boundary (before service)?
//   If invalid data (missing price, negative stock, bad URL)
//   reaches the DB, Mongoose throws a low-level error.
//   Zod catches it here and returns a clean, readable error message.
//
// Two schemas:
//   createProductSchema → all fields for creating a new product
//   updateProductSchema → same fields but all optional (partial update)
//     .partial() makes every field optional automatically
//     So you can send just { price: 999 } to update only the price
// ============================================================

const { z } = require("zod");

const createProductSchema = z.object({
  // Name: 3–100 characters, trimmed
  name: z
    .string()
    .trim()
    .min(3, "Product name must be at least 3 characters")
    .max(100, "Product name cannot exceed 100 characters"),

  // Description: 10–1000 characters
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description cannot exceed 1000 characters"),

  // Price: must be 0 or positive (no negative prices)
  price: z.number().nonnegative("Price cannot be negative"),

  // Category: minimum 2 characters (can't be a single letter)
  category: z.string().trim().min(2, "Category is required"),

  // Brand: optional
  brand: z.string().trim().optional(),

  // Stock: whole number, 0 or positive
  stock: z
    .number()
    .int("Stock must be an integer")
    .nonnegative("Stock cannot be negative"),

  // Image: must be a valid URL if provided (Phase 13 will replace with file upload)
  image: z.string().url("Image must be a valid URL").optional(),

  // isActive: optional boolean (defaults to true in the model)
  isActive: z.boolean().optional(),
});

module.exports = {
  createProductSchema,

  // .partial() makes all fields from createProductSchema optional
  // Used for PUT /api/products/:id — update only what is sent
  updateProductSchema: createProductSchema.partial(),
};
