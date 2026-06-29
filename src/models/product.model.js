// ============================================================
// models/product.model.js — Phase 3
// ============================================================
// Defines the Product schema — the blueprint for how a product
// document is stored in MongoDB.
//
// Why use a Mongoose schema?
//   Without it, MongoDB accepts any shape of data.
//   The schema enforces types, required fields, and constraints
//   at the database level — a second layer of protection
//   after Zod validation (which runs before the DB).
//
// Validation happens TWICE (by design):
//   1. Zod (product.validator.js) — validates incoming API request
//   2. Mongoose schema — validates before saving to MongoDB
// ============================================================

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Product name — required, trimmed, min/max length enforced
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },

    // Short description of the product
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    // Price in rupees — cannot be negative
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Category — e.g. Mobile, Laptop, Tablet
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    // Brand — e.g. Apple, Samsung (optional)
    brand: {
      type: String,
      trim: true,
      default: "",
    },

    // Available quantity in stock
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    // URL of the product image (optional for now, Phase 13 will add Cloudinary upload)
    image: {
      type: String,
      default: "",
    },

    // Soft delete flag — inactive products are hidden but not removed
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
