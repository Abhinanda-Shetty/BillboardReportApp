const { Router } = require("express");
const { getLeaderboard } = require("../controllers/leaderboard.controller");

const router = Router();

/**
 * @route  GET /api/leaderboard
 * @desc   Return ranked public users sorted by verified report count
 * @access Public
 */
router.get("/", getLeaderboard);

module.exports = router;
