const mongoose = require("mongoose");

// ✅ Comment sub-schema
const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// ✅ Main Status schema
const StatusSchema = new mongoose.Schema({
  UserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  Text: {
    type: String,
    default: ""
  },
  Image: {
    type: [String],
    default: []
  },
  Video: {
    type: String,
    default: ""
  },
  Likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  Comments: [CommentSchema],
  Shares: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Safe export to prevent OverwriteModelError
module.exports = mongoose.models.Status || mongoose.model("Status", StatusSchema);
