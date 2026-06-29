// ============================================================
// config/database.js — Phase 2
// ============================================================
// Handles the MongoDB Atlas connection using Mongoose.
//
// Why Mongoose over raw MongoDB driver?
//   - Gives us Schemas (blueprint for documents)
//   - Built-in validation
//   - Models to interact with collections
//   - Cleaner query syntax
//
// Why MongoDB Atlas?
//   - Cloud-hosted, accessible from anywhere
//   - No local MongoDB setup needed
//   - Easy to connect during deployment
// ============================================================

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Connect using the URI stored in .env
    // Example URI: mongodb+srv://user:pass@cluster.mongodb.net/dbname
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("✅ Your MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Your MongoDB Connection Failed");
    console.error(error.message);

    // Exit the process if DB connection fails
    // There is no point running the server without a database
    process.exit(1);
  }
};

module.exports = connectDB;
