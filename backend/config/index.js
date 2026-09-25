const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

/**
 * Connects to MongoDB Atlas using the MONGO_URI environment variable.
 * Exits the process if the connection fails on startup.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const host = process.env.MONGO_URI?.split("@")[1]?.split("/")[0];
    console.log(`[DB] Connected to MongoDB Atlas - host: ${host}`);
  } catch (err) {
    console.error("[DB] Connection failed:", err.message);
    console.error("[DB] Check: MONGO_URI in .env, Atlas IP whitelist, credentials.");
    throw err;
  }
};

mongoose.connection.on("error", (err) => {
  console.error("[DB] Runtime error:", err.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[DB] Disconnected from MongoDB.");
});

/**
 * Configures the Cloudinary SDK using environment variables.
 * Supports both CLOUDINARY_CLOUD_NAME and the legacy CLOUD_NAME variable.
 */
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Pings the Cloudinary API to verify credentials are correct.
 * Logs a warning on failure but does not exit the process.
 */
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    if (result && result.status === "ok") {
      console.log("[Cloudinary] Connected successfully.");
    }
  } catch (error) {
    console.error("[Cloudinary] Connection failed:", error.message);
  }
};

module.exports = { connectDB, configureCloudinary, testCloudinaryConnection };
