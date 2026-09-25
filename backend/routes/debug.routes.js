const { Router } = require("express");
const {
  getAllData,
  testDbConnection,
  verifyAllPending,
} = require("../controllers/debug.controller");

const router = Router();

/**
 * @route  GET /api/debug/all-data
 * @desc   Return all users and reports (development only)
 * @access Public (restrict to internal environments)
 */
router.get("/all-data", getAllData);

/**
 * @route  GET /api/debug/test-db
 * @desc   Return MongoDB connection state and document counts
 * @access Public (restrict to internal environments)
 */
router.get("/test-db", testDbConnection);

/**
 * @route  POST /api/debug/verify-all-pending
 * @desc   Mark every pending report as verified (testing only)
 * @access Public (restrict to internal environments)
 */
router.post("/verify-all-pending", verifyAllPending);

module.exports = router;
