const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: Authenticate requests using a JWT Bearer token.
 *
 * Reads the Authorization header, verifies the token, loads the corresponding
 * User document, and attaches it to `req.user` before calling `next()`.
 *
 * Responds with 401 if the token is missing, malformed, or expired.
 *
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ error: "Invalid token - user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = { authenticate };
