const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Generates a signed JWT for the given user.
 *
 * @param {Object} user - Mongoose User document.
 * @returns {string} Signed JWT string valid for 24 hours.
 */
const signToken = (user) =>
  jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

/**
 * POST /api/auth/register
 * Register a new user account.
 *
 * Body: { name, email, password, role? }
 * Returns 201 with { success, token, user } on success.
 * Returns 400 if required fields are missing or email is already registered.
 *
 * @type {import("express").RequestHandler}
 */
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "public",
    });

    const token = signToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    console.error("[AuthController] register error:", error.message);
    return res.status(500).json({ error: "Registration failed" });
  }
};

/**
 * POST /api/auth/login
 * Authenticate an existing user with email and password.
 *
 * Body: { email, password }
 * Returns 200 with { success, token, user } on success.
 * Returns 401 for invalid credentials.
 *
 * @type {import("express").RequestHandler}
 */
const login = async (req, res) => {
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

    const token = signToken(user);

    return res.json({
      success: true,
      token,
      user: {
        _id:   user._id,
        name:  user.name,
        email: user.email,
        role:  user.role,
      },
    });
  } catch (error) {
    console.error("[AuthController] login error:", error.message);
    return res.status(500).json({ error: "Login failed" });
  }
};

module.exports = { register, login };
