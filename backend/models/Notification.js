const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // যাকে notification যাবে
  type: { 
    type: String, 
    enum: ["request", "message", "like", "comment", "share"], 
    required: true 
  },
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // কে action করেছে
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // optional (like/comment/share এর জন্য)
  message: { type: String }, // custom text
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);