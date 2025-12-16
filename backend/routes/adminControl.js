const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Post = require("../models/Post");
const Advertise = require("../models/Advertise");
const Notification = require("../models/Notification");

// ==========================
// ✅ Middleware: verifyToken
// ==========================
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { _id, email, role }
    next();
  } catch (err) {
    return res.status(400).json({ error: "Invalid token" });
  }
}

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

// Make moderator (only admin can do this)
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

// Delete post
router.delete("/posts/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Block post
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

// Unblock post
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

// Get all advertise requests
router.get("/advertises", verifyToken, checkAdmin, async (req, res) => {
  try {
    const ads = await Advertise.find().populate("user", "username email");
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch advertises" });
  }
});

// Approve advertise
router.patch("/advertises/:id/approve", verifyToken, checkAdmin, async (req, res) => {
  try {
    const ad = await Advertise.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    ).populate("user", "username email");

    if (!ad) return res.status(404).json({ error: "Advertise not found" });

    // ✅ Notification for admin (action log)
    await Notification.create({
      user: req.user._id,
      type: "advertise",
      fromUser: ad.user._id,
      message: `Advertise approved: ${ad.title}`
    });

    // ✅ Notification for requester
    await Notification.create({
      user: ad.user._id,
      type: "advertise",
      fromUser: req.user._id,
      message: `Your advertise "${ad.title}" has been approved ✅`
    });

    res.json({ message: "✅ Advertise approved", ad });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve advertise" });
  }
});

// Delete/reject advertise
router.delete("/advertises/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const ad = await Advertise.findById(req.params.id).populate("user", "username email");
    if (!ad) return res.status(404).json({ error: "Advertise not found" });

    await Advertise.findByIdAndDelete(req.params.id);

    // ✅ Notification for admin (action log)
    await Notification.create({
      user: req.user._id,
      type: "advertise",
      fromUser: ad.user._id,
      message: `Advertise rejected/deleted: ${ad.title}`
    });

    // ✅ Notification for requester
    await Notification.create({
      user: ad.user._id,
      type: "advertise",
      fromUser: req.user._id,
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