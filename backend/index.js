const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// ✅ STEP 1: CREATE THE APP FIRST
const app = express();
const PORT = process.env.PORT || 5001;

// ✅ STEP 2: MIDDLEWARE
app.use(cors());
app.use(express.json());

// ✅ STEP 3: DATABASE CONNECTION
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    console.log(
      "🌐 Database:",
      process.env.MONGO_URI?.split("@")[1]?.split("/")
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("🔧 Check your:");
    console.error("   - MONGO_URI in .env file");
    console.error("   - IP whitelist in MongoDB Atlas");
    console.error("   - Username/password in connection string");
    process.exit(1);
  });

// Add connection event handlers
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});

// ✅ STEP 4: CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Test Cloudinary connection on startup
const testCloudinaryConnection = async () => {
  try {
    console.log("🌤️ Testing Cloudinary connection...");
    const result = await cloudinary.api.ping();
    if (result && result.status === "ok") {
      console.log("✅ Cloudinary connected successfully!");
    }
  } catch (error) {
    console.error("❌ Cloudinary connection failed:", error.message);
  }
};

// ✅ STEP 5: MULTER SETUP
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "billboard-reports",
    allowedFormats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  },
});

const upload = multer({ storage });

// ✅ STEP 6: SCHEMAS
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["public", "organization"], default: "public" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: { address: { type: String, required: true } },
    billboardDetails: { size: String, type: String, content: String },
    dateObserved: { type: Date, default: Date.now },
    dateReported: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    imageUrl: String,
    imageFileName: String,
    cloudinaryPublicId: String,
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

// ✅ STEP 7: AUTH MIDDLEWARE
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("🔐 Auth check - Token present:", !!token);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔓 Token decoded for user:", decoded.userId);

    const user = await User.findById(decoded.userId);

    if (!user) {
      console.log("❌ User not found for ID:", decoded.userId);
      return res.status(401).json({ error: "Invalid token" });
    }

    console.log("✅ Auth successful for:", user.name, "Role:", user.role);
    req.user = user;
    next();
  } catch (error) {
    console.error("❌ Auth error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

// ✅ STEP 8: ROUTES

// Register User
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "public",
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login User
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Create Report
app.post(
  "/api/reports",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { location, billboardDetails, dateObserved } = req.body;

      if (!location) {
        return res.status(400).json({ error: "Location is required" });
      }

      if (req.user.role === "public" && !req.file) {
        return res
          .status(400)
          .json({ error: "Image is required for public reports" });
      }

      const report = new Report({
        reporterId: req.user._id,
        location:
          typeof location === "string" ? JSON.parse(location) : location,
        billboardDetails:
          typeof billboardDetails === "string"
            ? JSON.parse(billboardDetails)
            : billboardDetails,
        dateObserved: dateObserved || new Date(),
        imageUrl: req.file?.path,
        imageFileName: req.file?.originalname,
        cloudinaryPublicId: req.file?.filename,
      });

      await report.save();
      await report.populate("reporterId", "name email role");

      res.status(201).json({
        success: true,
        message: "Report submitted successfully",
        report,
      });
    } catch (error) {
      console.error("Report creation error:", error);
      res.status(500).json({ error: "Failed to create report" });
    }
  }
);

// ✅ FIXED: Get Reports
app.get("/api/reports", authMiddleware, async (req, res) => {
  try {
    console.log(
      "📋 Fetching reports for user:",
      req.user.name,
      "Role:",
      req.user.role
    );

    let query = {};

    // Public users see only their reports, organization users see all
    if (req.user.role === "public") {
      query.reporterId = req.user._id;
    }

    console.log("🔍 Query filter:", query);

    const reports = await Report.find(query)
      .populate("reporterId", "name email role")
      .sort({ dateReported: -1 })
      .lean();

    console.log(`📊 Found ${reports.length} reports`);

    res.json({
      success: true,
      reports: reports,
      count: reports.length,
      user: {
        name: req.user.name,
        role: req.user.role,
        id: req.user._id,
      },
    });
  } catch (error) {
    console.error("❌ Get reports error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch reports",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// ✅ FIXED: Leaderboard Route
// ✅ SIMPLE LEADERBOARD WITH TIE-BREAKER (NO EXTRA UI)
// ✅ WORKING TIE-BREAKER LOGIC
// ✅ CORRECTED TIE-BREAKER LOGIC
app.get("/api/leaderboard", async (req, res) => {
  try {
    console.log("📊 Fetching leaderboard with corrected tie-breaker...");

    const publicUsers = await User.find({ role: "public" })
      .select("_id name email")
      .lean();

    // Get verified reports with user info to check who got the count first
    const verifiedReports = await Report.find({ status: "verified" })
      .populate("reporterId", "name")
      .select("reporterId dateReported")
      .sort({ dateReported: 1 }) // Earliest first
      .lean();

    console.log(`📋 Found ${verifiedReports.length} verified reports`);

    // Track when each user reached each count level
    const userProgress = {};

    verifiedReports.forEach((report) => {
      const userId = report.reporterId._id.toString();
      const userName = report.reporterId.name;

      if (!userProgress[userId]) {
        userProgress[userId] = {
          name: userName,
          currentCount: 0,
          countAchievementDates: {}, // When they reached each count
        };
      }

      userProgress[userId].currentCount++;
      const newCount = userProgress[userId].currentCount;

      // Record when they first reached this count
      if (!userProgress[userId].countAchievementDates[newCount]) {
        userProgress[userId].countAchievementDates[newCount] =
          report.dateReported;
      }
    });

    console.log("📊 User progress:", userProgress);

    // Create leaderboard
    const leaderboard = publicUsers.map((user) => {
      const progress = userProgress[user._id.toString()];
      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        verifiedCount: progress?.currentCount || 0,
        countAchievementDates: progress?.countAchievementDates || {},
      };
    });

    // Sort with correct tie-breaker
    leaderboard.sort((a, b) => {
      // Primary sort: Higher verified count wins
      if (a.verifiedCount !== b.verifiedCount) {
        return b.verifiedCount - a.verifiedCount;
      }

      // Tie-breaker: For same counts, who reached that count first
      if (a.verifiedCount > 0 && b.verifiedCount > 0) {
        const countToCheck = a.verifiedCount; // Same for both since they're tied
        const dateA = a.countAchievementDates[countToCheck];
        const dateB = b.countAchievementDates[countToCheck];

        if (dateA && dateB) {
          return new Date(dateA) - new Date(dateB); // Earlier date wins
        }
      }

      return 0; // Keep original order if no tie-breaker available
    });

    // Debug log
    console.log("🏆 Final ranking with tie-breaker:");
    leaderboard.slice(0, 5).forEach((user, index) => {
      const achievementDate = user.countAchievementDates[user.verifiedCount];
      console.log(
        `${index + 1}. ${user.name}: ${
          user.verifiedCount
        } reports (reached on: ${achievementDate || "N/A"})`
      );
    });

    res.json({
      success: true,
      leaderboard: leaderboard.map((user) => ({
        userId: user.userId,
        name: user.name,
        email: user.email,
        verifiedCount: user.verifiedCount,
      })),
      total: leaderboard.length,
    });
  } catch (error) {
    console.error("❌ Get leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Update Report Status
app.put("/api/reports/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "organization") {
      return res
        .status(403)
        .json({ error: "Only organizations can update reports" });
    }

    const { status } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("reporterId", "name email role");

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({ error: "Failed to update report" });
  }
});

// Delete Report
app.delete("/api/reports/:id", authMiddleware, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (
      req.user.role === "public" &&
      report.reporterId.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You can only delete your own reports" });
    }

    if (report.status !== "pending") {
      return res
        .status(403)
        .json({ error: "Only pending reports can be deleted" });
    }

    if (report.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(report.cloudinaryPublicId);
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

// Detection Endpoint
app.post("/api/detect", upload.single("photo"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No photo uploaded",
      });
    }

    res.json({
      success: true,
      message: "Billboard detected successfully!",
      imageUrl: req.file.path,
      violations: [
        { type: "Size", description: "Billboard exceeds allowed dimensions" },
        { type: "Location", description: "Placed in a restricted zone" },
      ],
    });
  } catch (error) {
    console.error("Detection error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during processing",
    });
  }
});

// ✅ Debug Routes
app.get("/api/debug-all-data", async (req, res) => {
  try {
    const allUsers = await User.find({}).select("name email role").lean();
    const allReports = await Report.find({})
      .populate("reporterId", "name email role")
      .select("reporterId status dateReported location")
      .lean();

    const userReports = {};
    allReports.forEach((report) => {
      if (report.reporterId) {
        const userId = report.reporterId._id.toString();
        if (!userReports[userId]) {
          userReports[userId] = {
            user: report.reporterId,
            reports: [],
          };
        }
        userReports[userId].reports.push({
          id: report._id,
          status: report.status,
          date: report.dateReported,
          location: report.location?.address,
        });
      }
    });

    res.json({
      success: true,
      totalUsers: allUsers.length,
      totalReports: allReports.length,
      publicUsers: allUsers.filter((u) => u.role === "public").length,
      organizationUsers: allUsers.filter((u) => u.role === "organization")
        .length,
      userReportsBreakdown: Object.values(userReports),
      sampleUsers: allUsers.slice(0, 3),
      sampleReports: allReports.slice(0, 3),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Quick test to verify all pending reports
app.post("/api/test/verify-all-pending", async (req, res) => {
  try {
    const result = await Report.updateMany(
      { status: "pending" },
      { status: "verified" }
    );

    res.json({
      success: true,
      message: `Verified ${result.modifiedCount} reports`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Database Connection Route
app.get("/api/test-db", async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState;
    const statusMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const userCount = await User.countDocuments();
    const reportCount = await Report.countDocuments();

    res.json({
      success: true,
      database_status: statusMap[dbStatus],
      connection_host: mongoose.connection.host,
      database_name: mongoose.connection.name,
      user_count: userCount,
      report_count: reportCount,
      message: "Database connection is working!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      database_status: "error",
    });
  }
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Billboard Reporting API is running!" });
});

// ✅ STEP 9: START SERVER
const startServer = async () => {
  try {
    await testCloudinaryConnection();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
      console.log("📱 React Native app can connect to this API");
      console.log("🔗 Health check: http://0.0.0.0:" + PORT);
      console.log("🧪 Database test: http://0.0.0.0:" + PORT + "/api/test-db");
      console.log(
        "🧪 Debug data: http://0.0.0.0:" + PORT + "/api/debug-all-data"
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("👋 SIGINT received. Shutting down gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();
