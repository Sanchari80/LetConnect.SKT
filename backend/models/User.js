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
      lowercase: true, // ✅ শুধু email lowercase হবে
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String, // profession (e.g., Developer, Designer, Student)
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
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "users" }
);

// ✅ Indexes for faster search
UserSchema.index({ username: "text", role: "text", skills: "text" });

module.exports = mongoose.model("User", UserSchema);