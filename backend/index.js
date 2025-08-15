// backend/index.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

// Enable CORS for all origins
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// Photo upload endpoint
app.post("/api/detect", upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded" });
    }

    console.log("Photo received:", {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Your detection logic would go here
    // For now, just return success
    res.json({
      message: "Photo received successfully",
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start server - bind to all interfaces so React Native can access it
app.listen(5000, "0.0.0.0", () => {
  console.log("Backend running on http://localhost:5000");
  console.log("Accessible from network on http://0.0.0.0:5000");
});
