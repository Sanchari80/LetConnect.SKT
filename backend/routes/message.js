const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ✅ Import controller functions (respecting capital C in folder name)
const messageController = require("../Controller/messageController");

// ✅ Storage setup for attachments
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/messages"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
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

// ✅ Routes
router.post(
  "/send-message",
  upload.array("attachments", 5), // optional attachments
  messageController.sendMessage
);

router.get("/:conversationId", messageController.getConversationById);

router.get("/user/:userId", messageController.getUserConversation);

module.exports = router;