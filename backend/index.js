const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 5000;

// Allow React Native app to access this server
app.use(cors());
app.use(express.json());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Backend server is running!" });
});

// API endpoint: detect billboard
app.post("/api/detect", upload.single("photo"), (req, res) => {
  try {
    console.log("File received:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No photo uploaded",
      });
    }

    // Mock response - replace with your ML detection logic
    res.json({
      success: true,
      message: "Billboard detected successfully!",
      filePath: req.file.path,
      filename: req.file.filename,
      violations: [
        { type: "Size", description: "Billboard exceeds allowed dimensions" },
        { type: "Location", description: "Placed in a restricted zone" },
      ],
    });
  } catch (error) {
    console.error("Error in /api/detect:", error);
    res.status(500).json({
      success: false,
      error: "Server error during processing",
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({
    success: false,
    error: err.message || "Server error",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
  console.log("Accessible from network");
  console.log(`Test URL: http://192.168.43.18:${PORT}`);
});
