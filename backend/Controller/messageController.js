const mongoose = require("mongoose");
const Message = require("../models/message");

// ==========================
// ✅ Send Message
// ==========================
const sendMessage = async (req, res) => {
  try {
    const { conversationId, receiver, text, emoji } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Message text is required" });
    }

    if (conversationId && !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    let attachments = [];
    if (req.files?.length > 0) {
      attachments = req.files.map((file) => ({
        path: `/uploads/messages/${file.filename}`,
        type: file.mimetype,
        size: file.size,
        originalName: file.originalname,
      }));
    }

    const message = new Message({
      conversationId: conversationId || undefined,
      sender: req.user.id, // ✅ enforce logged-in user
      receiver: receiver || undefined,
      text,
      emoji,
      attachments,
    });

    await message.save();

    const io = req.app.get("io");
    if (io) {
      if (conversationId) {
        io.to(conversationId).emit("receiveMessage", message);
      } else {
        io.emit("receiveMessage", message);
      }
    }

    res.status(201).json({ message: "✅ Message sent", data: message });
  } catch (err) {
    console.error("❌ Send message error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ==========================
// ✅ Get Conversation by ID
// ==========================
const getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ error: "Invalid conversation ID" });
    }

    const messages = await Message.find({ conversationId })
      .populate("sender", "username email _id") // ✅ consistent fields
      .sort({ createdAt: 1 });

    res.status(200).json({ message: "✅ Conversation fetched", data: messages });
  } catch (err) {
    console.error("❌ Get conversation error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ==========================
// ✅ Get User Conversation
// ==========================
const getUserConversation = async (req, res) => {
  try {
    const userId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json({ message: "✅ User conversation fetched", data: messages });
  } catch (err) {
    console.error("❌ Get user conversation error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getConversationById,
  getUserConversation,
};