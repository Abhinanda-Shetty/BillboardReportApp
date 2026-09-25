const mongoose = require("mongoose");

/**
 * @typedef {Object} User
 * @property {string} name       - Full name of the user.
 * @property {string} email      - Unique email address.
 * @property {string} password   - Bcrypt-hashed password.
 * @property {string} role       - Account type: "public" or "organization".
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["public", "organization"],
      default: "public",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
