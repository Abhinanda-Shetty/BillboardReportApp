const User   = require("../models/User");
const Report = require("../models/Report");

/**
 * GET /api/leaderboard
 * Returns a ranked list of public users ordered by their number of verified
 * reports. Ties are broken by who reached the same count first.
 *
 * Algorithm:
 *   1. Fetch all public users.
 *   2. Fetch all verified reports sorted by dateReported ascending.
 *   3. Track the date each user reached each cumulative report count.
 *   4. Sort by count descending; use the milestone date as the tie-breaker.
 *
 * Returns 200 with { success, total, leaderboard }.
 *
 * @type {import("express").RequestHandler}
 */
const getLeaderboard = async (req, res) => {
  try {
    const publicUsers = await User.find({ role: "public" })
      .select("_id name email")
      .lean();

    const verifiedReports = await Report.find({ status: "verified" })
      .populate("reporterId", "name")
      .select("reporterId dateReported")
      .sort({ dateReported: 1 }) // ascending - earliest first for tie-breaking
      .lean();

    // Build a progress map: userId -> { name, currentCount, countAchievementDates }
    const userProgress = {};

    verifiedReports.forEach((report) => {
      if (!report.reporterId) return;

      const userId   = report.reporterId._id.toString();
      const userName = report.reporterId.name;

      if (!userProgress[userId]) {
        userProgress[userId] = {
          name:  userName,
          currentCount: 0,
          countAchievementDates: {},
        };
      }

      userProgress[userId].currentCount++;
      const count = userProgress[userId].currentCount;

      // Record the date the user first reached this count level
      if (!userProgress[userId].countAchievementDates[count]) {
        userProgress[userId].countAchievementDates[count] = report.dateReported;
      }
    });

    // Map public users to leaderboard entries
    const leaderboard = publicUsers.map((user) => {
      const progress = userProgress[user._id.toString()];
      return {
        userId:               user._id,
        name:                 user.name,
        email:                user.email,
        verifiedCount:        progress?.currentCount || 0,
        countAchievementDates: progress?.countAchievementDates || {},
      };
    });

    // Sort: most reports first; on tie, whoever reached that count earlier wins
    leaderboard.sort((a, b) => {
      if (a.verifiedCount !== b.verifiedCount) {
        return b.verifiedCount - a.verifiedCount;
      }

      if (a.verifiedCount > 0) {
        const dateA = a.countAchievementDates[a.verifiedCount];
        const dateB = b.countAchievementDates[b.verifiedCount];
        if (dateA && dateB) {
          return new Date(dateA) - new Date(dateB);
        }
      }

      return 0;
    });

    // Strip internal tie-breaking data from the response
    const responseLeaderboard = leaderboard.map(({ userId, name, email, verifiedCount }) => ({
      userId,
      name,
      email,
      verifiedCount,
    }));

    return res.json({
      success:     true,
      total:       responseLeaderboard.length,
      leaderboard: responseLeaderboard,
    });
  } catch (error) {
    console.error("[LeaderboardController] getLeaderboard error:", error.message);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

module.exports = { getLeaderboard };
