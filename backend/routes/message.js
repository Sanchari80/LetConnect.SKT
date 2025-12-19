const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ✅ Import controller functions
const messageController = require("../Controller/messageController");

// ✅ Import verifyToken middleware
const verifyToken = require("../middleware/verifyToken");

// ✅ Storage setup for attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/messages"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

// ✅ Allowed file types
const allowedTypes = [
  "image/jpeg", "image/png", "image/jpg",
  "application/pdf", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg", "audio/mp3", "audio/wav",
  "video/mp4", "video/webm",
];

// ✅ File filter
const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("❌ Only image/pdf/doc/audio/video files allowed"), false);
};

// ✅ Multer middleware
const upload = multer({ storage, fileFilter });

// ==========================
// ✅ Routes
// ==========================

// Send a message (with optional attachments)
router.post(
  "/send-message",
  verifyToken,
  upload.array("attachments", 5),
  messageController.sendMessage
);

// Get conversation by ID
router.get("/:conversationId", verifyToken, messageController.getConversationById);

// Get all conversations for a user
router.get("/user/:userId", verifyToken, messageController.getUserConversation);

module.exports = router;