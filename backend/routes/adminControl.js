const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Advertise = require("../models/Advertise");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken"); // ✅ use shared middleware

// ==========================
// ✅ Middleware: checkAdmin
// ==========================
function checkAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Forbidden: Admins only" });
}

// ==========================
// ✅ User Management
// ==========================

// Delete user
router.delete("/users/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Block user
router.patch("/users/:id/block", verifyToken, checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: true },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to block user" });
  }
});

// Unblock user
router.patch("/users/:id/unblock", verifyToken, checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { blocked: false },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to unblock user" });
  }
});

// Make moderator
router.patch("/users/:id/make-moderator", verifyToken, checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: "moderator" },
      { new: true }
    ).select("-password");
    res.json({ message: "✅ User promoted to moderator", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to make moderator" });
  }
});

// ==========================
// ✅ Post Management
// ==========================

router.delete("/posts/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

router.patch("/posts/:id/block", verifyToken, checkAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { blocked: true },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to block post" });
  }
});

router.patch("/posts/:id/unblock", verifyToken, checkAdmin, async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { blocked: false },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to unblock post" });
  }
});

// ==========================
// ✅ Advertise Management
// ==========================

router.get("/advertises", verifyToken, checkAdmin, async (req, res) => {
  try {
    const ads = await Advertise.find().populate("user", "username email");
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch advertises" });
  }
});

router.patch("/advertises/:id/approve", verifyToken, checkAdmin, async (req, res) => {
  try {
    const ad = await Advertise.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).populate("user", "username email");

    if (!ad) return res.status(404).json({ error: "Advertise not found" });

    // ✅ Notifications
    await Notification.create({
      user: req.user.id,
      type: "advertise",
      fromUser: ad.user._id,
      message: `Advertise approved: ${ad.title}`
    });

    await Notification.create({
      user: ad.user._id,
      type: "advertise",
      fromUser: req.user.id,
      message: `Your advertise "${ad.title}" has been approved ✅`
    });

    res.json({ message: "✅ Advertise approved", ad });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve advertise" });
  }
});

router.delete("/advertises/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const ad = await Advertise.findById(req.params.id).populate("user", "username email");
    if (!ad) return res.status(404).json({ error: "Advertise not found" });

    await Advertise.findByIdAndDelete(req.params.id);

    await Notification.create({
      user: req.user.id,
      type: "advertise",
      fromUser: ad.user._id,
      message: `Advertise rejected/deleted: ${ad.title}`
    });

    await Notification.create({
      user: ad.user._id,
      type: "advertise",
      fromUser: req.user.id,
      message: `Your advertise "${ad.title}" has been rejected ❌`
    });

    res.json({ success: true, message: "Advertise deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete advertise" });
  }
});

// ==========================
// ✅ Notifications
// ==========================
router.get("/notifications", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "moderator") {
      return res.status(403).json({ error: "Forbidden: Only admin/moderator" });
    }

    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

module.exports = router;