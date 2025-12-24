const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken"); // ✅ shared middleware

// ==========================
// ✅ Get notifications for logged-in user
// ==========================
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate("fromUser", "username profileImage")
      .populate("post", "content")
      .sort({ createdAt: -1 });

    res.json({ success: true, notifications });
  } catch (err) {
    console.error("❌ Fetch notifications error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
});

// ==========================
// ✅ Mark notification as read
// ==========================
router.post("/:id/read", verifyToken, async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    // ✅ Ensure only owner can mark as read
    if (notif.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    notif.isRead = true;
    await notif.save();

    res.json({ success: true, message: "Notification marked as read", notification: notif });
  } catch (err) {
    console.error("❌ Mark as read error:", err.message);
    res.status(500).json({ success: false, message: "Failed to mark as read" });
  }
});

module.exports = router;