const { Router } = require("express");
const { register, login } = require("../controllers/auth.controller");

const router = Router();

/**
 * @route  POST /api/auth/register
 * @desc   Register a new user account
 * @access Public
 */
router.post("/register", register);

/**
 * @route  POST /api/auth/login
 * @desc   Authenticate a user and return a JWT
 * @access Public
 */
router.post("/login", login);

module.exports = router;
