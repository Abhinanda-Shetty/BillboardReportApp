/**
 * index.js - Vercel entry point
 *
 * Initializes MongoDB and Cloudinary before handling requests.
 * Vercel manages the HTTP server, so app.listen() is not required.
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = require("./app");
const {
  connectDB,
  configureCloudinary,
  testCloudinaryConnection,
} = require("./config");

let initialized = false;

const initializeServices = async () => {
  if (initialized) return;

  configureCloudinary();

  await connectDB();

  await testCloudinaryConnection();

  initialized = true;

  console.log("[Server] Services initialized successfully");
};

module.exports = async (req, res) => {
  try {
    await initializeServices();

    return app(req, res);
  } catch (err) {
    console.error("[Server] Initialization failed:", err.message);

    return res.status(500).json({
      success: false,
      error: "Server initialization failed",
    });
  }
};
