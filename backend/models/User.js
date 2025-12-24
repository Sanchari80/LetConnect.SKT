const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    Name: {
      type: String,
      required: true,
      trim: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // ✅ সব email lowercase হবে
    },
    Password: {
      type: String,
      required: true,
    },
    Role: {
      type: String,
      enum: ["user", "admin", "moderator"], // ✅ system roles
      default: "user",                      // signup এ সবসময় user হবে
    },
    Profession: {
      type: String, // e.g., Developer, Designer, Student
      trim: true,
    },
    Skills: [
      {
        type: String, // e.g., "React", "Node.js", "MongoDB"
        trim: true,
      },
    ],
    ProfileImage: {
      type: String,
      default: "/default-avatar.png", // ✅ default avatar
    },
    CvFile: {
      type: String, // ✅ CV file path (optional)
      default: null,
    },
    Contact: {
      type: String,
    },
    Blocked: {
      type: Boolean, // ✅ admin block/unblock করতে পারবে
      default: false,
    },
    CreatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "users" }
);

// ✅ Indexes for faster search (capitalized fields)
UserSchema.index({ Name: "text", Role: "text", Skills: "text" });

module.exports = mongoose.model("User", UserSchema);