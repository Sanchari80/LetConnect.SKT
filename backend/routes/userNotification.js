const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken"); // ✅ use shared middleware

// ✅ Get notifications for logged-in user only
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("fromUser", "username email");

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("❌ Fetch notifications error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

module.exports = router;