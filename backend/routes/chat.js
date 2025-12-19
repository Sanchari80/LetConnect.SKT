const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken"); // ✅ Updated middleware
const Message = require("../models/message");
const path = require("path");
const multer = require("multer");

// ==========================
// ✅ Multer Storage setup
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads/messages"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const allowedTypes = [
  "image/jpeg", "image/png", "image/jpg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "audio/mpeg", "audio/mp3", "audio/wav",
  "video/mp4", "video/webm"
];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("❌ Only image/pdf/doc/audio/video files allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ==========================
// ✅ Send a message (text + emoji + attachments)
// ==========================
router.post("/send", verifyToken, upload.array("attachments", 5), async (req, res) => {
  try {
    const { to, text, emoji } = req.body;
    if (!to) return res.status(400).json({ message: "Recipient required" });

    const attachments = req.files?.map((file) => ({
      path: `/uploads/messages/${file.filename}`,
      type: file.mimetype,
      size: file.size,
    })) || [];

    const newMessage = new Message({
      sender: req.user.id,
      receiver: to,
      text: text || "",
      emoji: emoji || null,
      attachments,
    });

    const savedMessage = await newMessage.save();

    // ✅ Emit via socket.io if available
    const io = req.app.get("io");
    if (io) io.emit("receiveMessage", savedMessage);

    res.status(201).json({ message: "Message sent", data: savedMessage });
  } catch (err) {
    console.error("❌ Error sending message:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ==========================
// ✅ Inbox (messages received by current user)
// ==========================
router.get("/inbox", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user.id }).sort({ sentAt: -1 });
    res.json({ messages });
  } catch (err) {
    console.error("❌ Error fetching inbox:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ==========================
// ✅ Outbox (messages sent by current user)
// ==========================
router.get("/outbox", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user.id }).sort({ sentAt: -1 });
    res.json({ messages });
  } catch (err) {
    console.error("❌ Error fetching outbox:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;