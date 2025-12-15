const mongoose = require("mongoose");

// Comment sub-schema
const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Main Status schema
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
  // ✅ Multiple images allowed
  Image: {
    type: [String],
    default: []
  },
  // ✅ Single video
  Video: {
    type: String,
    default: ""
  },
  // ✅ Likes (array of users)
  Likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  // ✅ Comments (array of CommentSchema)
  Comments: [CommentSchema],
  // ✅ Shares (array of users)
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

module.exports = mongoose.model("Status", StatusSchema);