const mongoose = require("mongoose");

/**
 * @typedef {Object} BillboardDetails
 * @property {string} size    - Physical size category of the billboard.
 * @property {string} type    - Advertising category (commercial, political, etc.).
 * @property {string} content - Description of the billboard content or violations.
 */

/**
 * @typedef {Object} Report
 * @property {ObjectId} reporterId          - Reference to the User who filed the report.
 * @property {{ address: string }} location - Geographic address of the billboard.
 * @property {BillboardDetails} billboardDetails - Details about the billboard.
 * @property {Date} dateObserved            - When the billboard was observed.
 * @property {Date} dateReported            - When the report was submitted.
 * @property {string} status               - Verification status: pending | verified | rejected.
 * @property {string} imageUrl             - Cloudinary secure URL of the uploaded image.
 * @property {string} imageFileName        - Original filename of the uploaded image.
 * @property {string} cloudinaryPublicId   - Cloudinary public ID used for deletion.
 */
const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reporter ID is required"],
    },
    location: {
      address: {
        type: String,
        required: [true, "Location address is required"],
      },
    },
    billboardDetails: {
      size:    { type: String },
      type:    { type: String },
      content: { type: String },
    },
    dateObserved: {
      type: Date,
      default: Date.now,
    },
    dateReported: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    imageUrl:            { type: String },
    imageFileName:       { type: String },
    cloudinaryPublicId:  { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
