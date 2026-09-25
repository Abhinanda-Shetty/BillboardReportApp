const cloudinary = require("cloudinary").v2;
const Report = require("../models/Report");

/**
 * Safely parses a value that may be a JSON string or already an object.
 * Falls back to a default object if parsing fails.
 *
 * @param {string|Object} value    - The value to parse.
 * @param {Object} fallback        - Returned when parsing fails.
 * @returns {Object}
 */
const safeParseJSON = (value, fallback = {}) => {
  if (typeof value !== "string") return value || fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

/**
 * POST /api/reports
 * Create a new billboard violation report.
 *
 * Requires authentication (req.user populated by authenticate middleware).
 * Public users must attach an image; organization users may omit it.
 * The image is uploaded to Cloudinary via the uploadSingle middleware before
 * this handler runs.
 *
 * Body (multipart/form-data):
 *   - location        {string} JSON string: { address: string }
 *   - billboardDetails {string} JSON string: { size, type, content }
 *   - dateObserved    {string} ISO date string (optional)
 *   - image           {file}   JPEG / PNG image file
 *
 * Returns 201 with { success, message, report } on success.
 *
 * @type {import("express").RequestHandler}
 */
const createReport = async (req, res) => {
  try {
    const { location, billboardDetails, dateObserved } = req.body;

    if (!location) {
      return res.status(400).json({ error: "Location is required" });
    }

    if (req.user.role === "public" && !req.file) {
      return res.status(400).json({ error: "Image is required for public reports" });
    }

    const parsedLocation       = safeParseJSON(location,       { address: location });
    const parsedBillboardDetails = safeParseJSON(billboardDetails, {});

    const report = await Report.create({
      reporterId:        req.user._id,
      location:          parsedLocation,
      billboardDetails:  parsedBillboardDetails,
      dateObserved:      dateObserved || new Date(),
      imageUrl:          req.file?.path,
      imageFileName:     req.file?.originalname,
      cloudinaryPublicId: req.file?.filename,
    });

    await report.populate("reporterId", "name email role");

    console.log(`[ReportController] Report created: ${report._id} by ${req.user.name}`);

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("[ReportController] createReport error:", error.message);
    return res.status(500).json({ error: error.message || "Failed to create report" });
  }
};

/**
 * GET /api/reports
 * Retrieve reports.
 *
 * - Public users receive only their own reports.
 * - Organization users receive all reports across all users.
 *
 * Returns 200 with { success, count, user, reports }.
 *
 * @type {import("express").RequestHandler}
 */
const getReports = async (req, res) => {
  try {
    const filter = req.user.role === "public"
      ? { reporterId: req.user._id }
      : {};

    const reports = await Report.find(filter)
      .populate("reporterId", "name email role")
      .sort({ dateReported: -1 })
      .lean();

    return res.json({
      success: true,
      count: reports.length,
      user: {
        id:   req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
      reports,
    });
  } catch (error) {
    console.error("[ReportController] getReports error:", error.message);
    return res.status(500).json({
      success: false,
      error:   "Failed to fetch reports",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * PUT /api/reports/:id
 * Update the status of a report (organization accounts only).
 *
 * Body: { status } - One of: "pending" | "verified" | "rejected"
 * Returns 200 with { success, report } on success.
 * Returns 403 if called by a non-organization user or 404 if not found.
 *
 * @type {import("express").RequestHandler}
 */
const updateReportStatus = async (req, res) => {
  try {
    if (req.user.role !== "organization") {
      return res.status(403).json({ error: "Only organization accounts can update reports" });
    }

    const { status } = req.body;
    const validStatuses = ["pending", "verified", "rejected"];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("reporterId", "name email role");

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    return res.json({ success: true, report });
  } catch (error) {
    console.error("[ReportController] updateReportStatus error:", error.message);
    return res.status(500).json({ error: "Failed to update report" });
  }
};

/**
 * DELETE /api/reports/:id
 * Delete a pending report.
 *
 * Rules:
 *   - Public users may only delete their own reports.
 *   - Organization users may delete any report.
 *   - Only reports with status "pending" may be deleted.
 *   - The associated Cloudinary image is also removed.
 *
 * Returns 200 with { success, message } on success.
 *
 * @type {import("express").RequestHandler}
 */
const deleteReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (
      req.user.role === "public" &&
      report.reporterId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: "You can only delete your own reports" });
    }

    if (report.status !== "pending") {
      return res.status(403).json({ error: "Only pending reports can be deleted" });
    }

    if (report.cloudinaryPublicId) {
      await cloudinary.uploader.destroy(report.cloudinaryPublicId);
    }

    await Report.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: "Report deleted successfully" });
  } catch (error) {
    console.error("[ReportController] deleteReport error:", error.message);
    return res.status(500).json({ error: "Failed to delete report" });
  }
};

module.exports = { createReport, getReports, updateReportStatus, deleteReport };
