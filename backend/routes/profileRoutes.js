const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/upload"); // multer middleware

// ==========================
// ✅ Get logged-in user's profile
// ==========================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-Password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "✅ Profile fetched successfully", user });
  } catch (err) {
    console.error("Profile fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Update profile (Name, Contact, ProfilePic)
// ==========================
router.put(
  "/update",
  authMiddleware,
  upload.single("ProfilePic"), // 👈 optional profile picture upload
  async (req, res) => {
    try {
      const updates = {
        Name: req.body.Name || req.user.Name,
        Contact: req.body.Contact || req.user.Contact,
      };

      if (req.file) {
        updates.ProfilePic = `/upload/${req.file.filename}`;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true }
      ).select("-Password");

      res.json({ message: "✅ Profile updated successfully", user: updatedUser });
    } catch (err) {
      console.error("Profile update error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

module.exports = router;