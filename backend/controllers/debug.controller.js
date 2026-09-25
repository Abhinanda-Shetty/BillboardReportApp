const mongoose = require("mongoose");
const User     = require("../models/User");
const Report   = require("../models/Report");

/**
 * GET /api/debug/all-data
 * Returns a summary of all users and reports in the database.
 *
 * Intended for development use only.
 * Provides a breakdown of reports grouped by reporter.
 *
 * @type {import("express").RequestHandler}
 */
const getAllData = async (req, res) => {
  try {
    const allUsers = await User.find({}).select("name email role").lean();
    const allReports = await Report.find({})
      .populate("reporterId", "name email role")
      .select("reporterId status dateReported location")
      .lean();

    const reportsByUser = {};
    allReports.forEach((report) => {
      if (!report.reporterId) return;
      const userId = report.reporterId._id.toString();
      if (!reportsByUser[userId]) {
        reportsByUser[userId] = { user: report.reporterId, reports: [] };
      }
      reportsByUser[userId].reports.push({
        id:       report._id,
        status:   report.status,
        date:     report.dateReported,
        location: report.location?.address,
      });
    });

    return res.json({
      success:              true,
      totalUsers:           allUsers.length,
      totalReports:         allReports.length,
      publicUsers:          allUsers.filter((u) => u.role === "public").length,
      organizationUsers:    allUsers.filter((u) => u.role === "organization").length,
      userReportsBreakdown: Object.values(reportsByUser),
      sampleUsers:          allUsers.slice(0, 3),
      sampleReports:        allReports.slice(0, 3),
    });
  } catch (error) {
    console.error("[DebugController] getAllData error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/debug/test-db
 * Returns the current MongoDB connection state and document counts.
 *
 * @type {import("express").RequestHandler}
 */
const testDbConnection = async (req, res) => {
  try {
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const userCount   = await User.countDocuments();
    const reportCount = await Report.countDocuments();

    return res.json({
      success:           true,
      database_status:   stateMap[mongoose.connection.readyState],
      connection_host:   mongoose.connection.host,
      database_name:     mongoose.connection.name,
      user_count:        userCount,
      report_count:      reportCount,
      message:           "Database connection is working",
    });
  } catch (error) {
    console.error("[DebugController] testDbConnection error:", error.message);
    return res.status(500).json({
      success:         false,
      database_status: "error",
      error:           error.message,
    });
  }
};

/**
 * POST /api/debug/verify-all-pending
 * Sets the status of every pending report to "verified".
 *
 * For development and testing only.
 *
 * @type {import("express").RequestHandler}
 */
const verifyAllPending = async (req, res) => {
  try {
    const result = await Report.updateMany(
      { status: "pending" },
      { status: "verified" }
    );
    return res.json({
      success:       true,
      message:       `Verified ${result.modifiedCount} reports`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("[DebugController] verifyAllPending error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllData, testDbConnection, verifyAllPending };
