const express = require("express");
const cors = require("cors");

// Route modules
const authRoutes = require("./routes/auth.routes");
const reportRoutes = require("./routes/report.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const detectionRoutes = require("./routes/detection.routes");
const debugRoutes = require("./routes/debug.routes");

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/detect", detectionRoutes);
app.use("/api/debug", debugRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Billboard Reporting API is running" });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res
    .status(404)
    .json({ error: `Route ${req.method} ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any error passed via next(err) from route handlers or middleware.
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  console.error("[App] Unhandled error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
