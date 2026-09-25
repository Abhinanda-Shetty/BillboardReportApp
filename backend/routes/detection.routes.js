const { Router } = require("express");
const { uploadSingle } = require("../middlewares/upload");
const { detectBillboard } = require("../controllers/detection.controller");

const router = Router();

/**
 * @route  POST /api/detect
 * @desc   Upload a billboard photo and receive simulated violation analysis
 * @access Public
 */
router.post("/", uploadSingle("photo"), detectBillboard);

module.exports = router;
