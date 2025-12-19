const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Conversation = require("../models/Conversation");
const Message = require("../models/message");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken"); // ✅ Updated middleware

// ==========================
// ✅ Start a new conversation
// ==========================
router.post("/start", verifyToken, async (req, res) => {
  try {
    const { receiverId, text, emoji, attachments } = req.body;
    const senderId = req.user.id; // ✅ from token

    const convo = new Conversation({ participants: [senderId, receiverId], status: "pending" });
    await convo.save();

    const firstMsg = new Message({
      conversationId: convo._id,
      sender: senderId,
      receiver: receiverId,
      text,
      emoji: emoji || null,
      attachments: attachments || [],
    });
    await firstMsg.save();

    await new Notification({
      user: receiverId,
      type: "request",
      fromUser: senderId,
      message: "sent you a LetConnect request",
    }).save();

    res.json({ convo, firstMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// ✅ Accept request
// ==========================
router.post("/:id/accept", verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid conversation ID" });

    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    convo.status = "accepted";
    await convo.save();

    const [senderId, receiverId] = convo.participants;

    await new Notification({
      user: senderId,
      type: "request",
      fromUser: receiverId,
      message: "accepted your LetConnect request",
    }).save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// ❌ Reject request
// ==========================
router.post("/:id/reject", verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid conversation ID" });

    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    convo.status = "rejected";
    await convo.save();

    const [senderId, receiverId] = convo.participants;

    await new Notification({
      user: senderId,
      type: "request",
      fromUser: receiverId,
      message: "rejected your LetConnect request",
    }).save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// ✅ Send message (only if accepted)
// ==========================
router.post("/:id/message", verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid conversation ID" });

    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: "Conversation not found" });
    if (convo.status !== "accepted") return res.status(403).json({ error: "Conversation not accepted yet" });

    const senderId = req.user.id; // ✅ from token
    const receiverId = convo.participants.find((p) => p.toString() !== senderId);

    const newMsg = new Message({
      conversationId: convo._id,
      sender: senderId,
      receiver: receiverId,
      text: req.body.text,
      emoji: req.body.emoji || null,
      attachments: req.body.attachments || [],
    });
    await newMsg.save();

    await new Notification({
      user: receiverId,
      type: "message",
      fromUser: senderId,
      message: "sent you a new message",
    }).save();

    const io = req.app.get("io");
    if (io) io.to(convo._id.toString()).emit("receiveMessage", newMsg);

    res.json(newMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// ✅ Get conversation by ID
// ==========================
router.get("/:id", verifyToken, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: "Invalid conversation ID" });

    const convo = await Conversation.findById(req.params.id).populate("participants", "username email _id");
    if (!convo) return res.status(404).json({ error: "Conversation not found" });

    res.json(convo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;