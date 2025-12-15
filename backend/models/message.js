const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: { type: String, trim: true },
    emoji: { type: String, trim: true },
    attachments: [
      {
        path: { type: String, required: true },
        type: { type: String, required: true },
        size: { type: Number },
        originalName: { type: String },
      },
    ],
    sentAt: { type: Date, default: Date.now },
  },
  { collection: "messages", timestamps: true }
);

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);