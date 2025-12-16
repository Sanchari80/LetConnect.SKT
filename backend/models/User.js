const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // ✅ সব email lowercase হবে
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "moderator"], // ✅ system roles
      default: "user",                      // signup এ সবসময় user হবে
    },
    profession: {
      type: String, // e.g., Developer, Designer, Student
      trim: true,
    },
    skills: [
      {
        type: String, // e.g., "React", "Node.js", "MongoDB"
        trim: true,
      },
    ],
    profileImage: {
      type: String,
      default: "/default-avatar.png", // ✅ default avatar
    },
    cvFile: {
      type: String, // ✅ CV file path (optional)
      default: null,
    },
    contact: {
      type: String,
    },
    blocked: {
      type: Boolean, // ✅ admin block/unblock করতে পারবে
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "users" }
);

// ✅ Indexes for faster search
UserSchema.index({ username: "text", profession: "text", skills: "text" });

module.exports = mongoose.model("User", UserSchema);