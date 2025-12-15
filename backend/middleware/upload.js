const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Ensure subfolders exist
const baseUploadPath = path.join(__dirname, "../uploads");
const profilePath = path.join(baseUploadPath, "profile");
const cvPath = path.join(baseUploadPath, "cv");
const messagePath = path.join(baseUploadPath, "messages");

[baseUploadPath, profilePath, cvPath, messagePath].forEach((p) => {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
});

// ✅ Multer storage setup (dynamic folder based on fieldname)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "profileImage") {
      cb(null, profilePath);
    } else if (file.fieldname === "cv") {
      cb(null, cvPath);
    } else if (file.fieldname === "attachments") {
      cb(null, messagePath);
    } else {
      cb(null, baseUploadPath); // fallback
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// ✅ File filter (allow images, pdf/docx, audio, video)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "audio/mpeg",
    "audio/wav",
    "video/mp4",
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Invalid file type"), false);
  }
};

// ✅ Multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

module.exports = upload;