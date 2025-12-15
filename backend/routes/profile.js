const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // ✅ Multer middleware

// ==========================
// ✅ Get logged-in user's profile
// ==========================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // ✅ Password বাদ দাও
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "✅ Profile fetched successfully", user });
  } catch (err) {
    console.error("❌ Profile fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Update profile (Name, Contact, ProfilePic)
// ==========================
router.put(
  "/update",
  authMiddleware,
  upload.single("profileImage"), // 👈 field name must match frontend
  async (req, res) => {
    try {
      const updates = {
        name: req.body.name || req.user.name,
        contact: req.body.contact || req.user.contact,
      };

      // ✅ If profile picture uploaded
      if (req.file) {
        updates.profileImage = `/uploads/profile/${req.file.filename}`;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        message: "✅ Profile updated successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("❌ Profile update error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ==========================
// ✅ Upload profile picture only
// ==========================
router.post(
  "/upload-image",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profileImage: `/uploads/profile/${req.file.filename}` },
        { new: true }
      ).select("-password");

      res.json({
        message: "✅ Profile picture uploaded successfully",
        user: updatedUser,
      });
    } catch (err) {
      console.error("❌ Profile picture upload error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;