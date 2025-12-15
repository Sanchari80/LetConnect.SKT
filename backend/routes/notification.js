const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");

// ✅ Get all notifications for a user
router.get("/:userId", async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.params.userId })
      .populate("fromUser", "Name ProfileImage")
      .populate("post", "content")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ✅ Mark notification as read
router.post("/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findById(req.params.id);
    if (!notif) return res.status(404).json({ error: "Notification not found" });

    notif.isRead = true;
    await notif.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

module.exports = router;