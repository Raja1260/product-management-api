// ============================================================
// repositories/product.repository.js — Phase 3, 5, 6, 7, 8, 9
// ============================================================
// Handles all database operations for the Product collection.
//
// Phase 3  → create, findById, findByName, updateById, deleteById
// Phase 5  → used in all 5 CRUD operations
// Phase 6  → findAll: added pagination (skip, limit, countDocuments)
// Phase 7  → findAll: added search with $regex
// Phase 8  → findAll: added category, brand, price filters
// Phase 9  → findAll: added sorting with allowed fields validation
//
// Rule: ONLY this file talks to MongoDB.
//       Service layer calls these methods — never writes queries itself.
// ============================================================

const Product = require("../models/product.model");

class ProductRepository {
  // ── Phase 5 ───────────────────────────────────────────────

  // Save a new product to MongoDB
  async create(productData) {
    return await Product.create(productData);
  }

  // Find one product by MongoDB _id
  async findById(id) {
    return await Product.findById(id);
  }

  // Find a product by exact name — used to check for duplicates
  async findByName(name) {
    return await Product.findOne({ name });
  }

  // Update a product by id, return the updated document
  // new: true     → return the updated doc, not the old one
  // runValidators → run Mongoose schema validators on the update data
  async updateById(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // Permanently delete a product by id
  async deleteById(id) {
    return await Product.findByIdAndDelete(id);
  }

  // ── Phase 6, 7, 8, 9 ──────────────────────────────────────
  // findAll handles: pagination + search + filtering + sorting
  // All controlled by query parameters from the URL
  async findAll(query = {}) {

    // ── Phase 6: Pagination ──────────────────────────────────
    // Read page and limit from query string, apply defaults
    // page=1, limit=10 if not provided
    const page  = parseInt(query.page)  || 1;
    const limit = parseInt(query.limit) || 10;

    // skip = how many documents to skip to reach the requested page
    // Example: page 2, limit 5 → skip 5 documents
    const skip  = (page - 1) * limit;

    // ── Phase 7: Search ──────────────────────────────────────
    const search = query.search || "";

    // ── Phase 8: Filters ─────────────────────────────────────
    const category = query.category || "";
    const brand    = query.brand    || "";
    const minPrice = query.minPrice;
    const maxPrice = query.maxPrice;

    // ── Phase 9: Sorting ─────────────────────────────────────
    // Default: newest products first (-createdAt)
    const sort = query.sort || "-createdAt";

    // ── Build the filter object ───────────────────────────────
    // Starts empty — means "fetch all products"
    // Fields are added only when the query param is provided
    const filter = {};

    // Phase 7: Search filter
    // $regex lets MongoDB search for a pattern inside a string
    // $options: "i" makes it case-insensitive
    // So "iphone", "IPHONE", "iPhone" all match
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Phase 8: Category filter — exact match
    if (category) {
      filter.category = category;
    }

    // Phase 8: Brand filter — exact match
    if (brand) {
      filter.brand = brand;
    }

    // Phase 8: Price range filter
    // $gte = greater than or equal (minPrice)
    // $lte = less than or equal (maxPrice)
    // Both can be used together for a range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // ── Phase 9: Build sort object ───────────────────────────
    // Only allow sorting on known fields — prevents arbitrary DB queries
    const allowedSortFields = ["price", "name", "createdAt", "stock", "brand", "category"];

    let sortField = "createdAt";
    let sortOrder = -1; // -1 = descending, 1 = ascending

    // A leading "-" means descending: ?sort=-price → sort by price descending
    if (sort.startsWith("-")) {
      sortField = sort.substring(1);
      sortOrder = -1;
    } else {
      sortField = sort;
      sortOrder = 1;
    }

    // If the requested sort field is not in the allowed list, use default
    if (!allowedSortFields.includes(sortField)) {
      sortField = "createdAt";
      sortOrder = -1;
    }

    // MongoDB sort object: { price: -1 } or { name: 1 }
    const sortOption = {};
    sortOption[sortField] = sortOrder;

    // ── Fetch products ────────────────────────────────────────
    // Apply all filters, sorting, and pagination in one query
    const products = await Product.find(filter)
      .sort(sortOption) // Phase 9
      .skip(skip)       // Phase 6
      .limit(limit);    // Phase 6

    // ── Count matching documents for pagination metadata ──────
    // Must use the same filter — count only filtered results, not all products
    const totalProducts = await Product.countDocuments(filter);

    // ── Pagination metadata ───────────────────────────────────
    const totalPages = Math.ceil(totalProducts / limit);

    return {
      products,
      pagination: {
        totalProducts,
        currentPage:  page,
        totalPages,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}

module.exports = new ProductRepository();
