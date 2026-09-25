const { Router } = require("express");
const { authenticate } = require("../middlewares/auth");
const { uploadSingle }  = require("../middlewares/upload");
const {
  createReport,
  getReports,
  updateReportStatus,
  deleteReport,
} = require("../controllers/report.controller");

const router = Router();

/**
 * @route  POST /api/reports
 * @desc   Submit a new billboard violation report with an image
 * @access Private (public and organization users)
 */
router.post("/", authenticate, uploadSingle("image"), createReport);

/**
 * @route  GET /api/reports
 * @desc   Retrieve reports (own reports for public; all for organization)
 * @access Private
 */
router.get("/", authenticate, getReports);

/**
 * @route  PUT /api/reports/:id
 * @desc   Update the status of a report (organization only)
 * @access Private (organization)
 */
router.put("/:id", authenticate, updateReportStatus);

/**
 * @route  DELETE /api/reports/:id
 * @desc   Delete a pending report and its Cloudinary image
 * @access Private (owner or organization)
 */
router.delete("/:id", authenticate, deleteReport);

module.exports = router;
