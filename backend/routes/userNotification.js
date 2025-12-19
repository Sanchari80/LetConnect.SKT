const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken"); // ✅ use shared middleware

// ✅ Get notifications for logged-in user only
router.get("/notifications", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("fromUser", "username email");

    res.json(notifications);
  } catch (err) {
    console.error("❌ Fetch notifications error:", err.message);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

module.exports = router;