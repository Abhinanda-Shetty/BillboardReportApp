/**
 * index.js - Server entry point
 *
 * Responsibilities:
 *   1. Load environment variables.
 *   2. Connect to MongoDB and configure Cloudinary.
 *   3. Import the Express app.
 *   4. Start the HTTP server.
 *   5. Handle graceful shutdown signals.
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const app      = require("./app");
const {
  connectDB,
  configureCloudinary,
  testCloudinaryConnection,
} = require("./config");

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  // Initialise third-party services before accepting requests
  configureCloudinary();
  await connectDB();
  await testCloudinaryConnection();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
    console.log(`[Server] Health check: http://0.0.0.0:${PORT}/`);
    console.log(`[Server] DB check:     http://0.0.0.0:${PORT}/api/debug/test-db`);
  });
};

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`[Server] ${signal} received - shutting down gracefully.`);
  await mongoose.connection.close();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

// ─── Boot ─────────────────────────────────────────────────────────────────────
startServer().catch((err) => {
  console.error("[Server] Failed to start:", err.message);
  process.exit(1);
});
