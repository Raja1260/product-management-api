// ============================================================
// server.js — Phase 2
// ============================================================
// This is the ENTRY POINT of the application.
// Node.js starts from here.
//
// Responsibilities:
//   1. Load environment variables from .env
//   2. Connect to MongoDB Atlas
//   3. Start the Express server on a port
//
// Why separate server.js and app.js?
//   app.js  → sets up Express (routes, middlewares)
//   server.js → connects DB and starts listening
//   This separation makes testing easier later.
// ============================================================

// Load .env variables before anything else
// So process.env.PORT, process.env.MONGODB_URI are available
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/database");

// Read PORT from .env or fallback to 5000
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Step 1: Connect to MongoDB Atlas first
    // If DB connection fails, don't start the server
    await connectDB();

    // Step 2: Start Express server only after DB is connected
    app.listen(PORT, () => {
      console.log(`🚀 Your Product Management Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    // If anything fails during startup, log and exit
    console.error("Server startup failed:", error);
  }
};

startServer();
