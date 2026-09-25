const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "billboard-reports",
    allowedFormats: ["jpg", "jpeg", "png"],
    transformation: [
      {
        width: 1000,
        height: 1000,
        crop: "limit",
      },
    ],
  },
});

const multerUpload = multer({
  storage,
});

const uploadSingle = (fieldName) => (req, res, next) => {
  console.log("\n========================================");
  console.log("[Upload] 📤 UPLOAD REQUEST STARTED");
  console.log("========================================");

  console.log("[Upload] Expected field:", fieldName);
  console.log("[Upload] Method:", req.method);
  console.log("[Upload] URL:", req.originalUrl);
  console.log("[Upload] Content-Type:", req.headers["content-type"]);

  multerUpload.single(fieldName)(req, res, (err) => {
    if (err) {
      console.error("\n========================================");
      console.error("[Upload] ❌ MULTER/CLOUDINARY ERROR");
      console.error("========================================");

      console.error("Message:", err.message);
      console.error("Name:", err.name);
      console.error("Code:", err.code);
      console.error("Stack:", err.stack);

      console.error("========================================\n");

      return res.status(400).json({
        success: false,
        error: `Image upload failed: ${err.message || "Unknown error"}`,
      });
    }

    console.log("[Upload] ✅ Multer finished successfully");

    console.log(
      "[Upload] File:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
            filename: req.file.filename,
          }
        : "❌ NO FILE"
    );

    console.log("[Upload] ➡️ Passing request to controller...");

    next();
  });
};

module.exports = { uploadSingle };
