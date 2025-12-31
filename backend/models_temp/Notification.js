const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    // যাকে notification যাবে
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // notification type
    type: {
      type: String,
      enum: [
        "request",
        "message",
        "like",
        "comment",
        "share",
        "advertise_approved",
        "advertise_rejected",
      ],
      required: true,
    },

    // কে action করেছে (admin/moderator/user)
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // optional post reference (like/comment/share এর জন্য)
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },

    // custom message
    message: { type: String, trim: true },

    // read/unread status
    isRead: { type: Boolean, default: false },
  },
  { collection: "notifications", timestamps: true } // ✅ auto createdAt & updatedAt
);

module.exports = mongoose.model("Notification", NotificationSchema);