const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Advertise = require("../models/Advertise");
const Notification = require("../models/Notification");

// ==========================
// ✅ Create an advertisement request (approved=false)
// ==========================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, link } = req.body;

    const ad = new Advertise({
      user: req.user._id,
      title,
      description,
      link,
      approved: false, // 👈 default false
    });

    const savedAd = await ad.save();

    // ✅ Notification for requester (নিজের কাছে যাবে)
    await Notification.create({
      user: req.user._id,
      type: "advertise",
      fromUser: req.user._id,
      message: `Your advertise request "${title}" has been submitted`,
    });

    res.status(201).json({ message: "✅ Advertisement request submitted", ad: savedAd });
  } catch (err) {
    console.error("❌ Advertise create error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Get all approved advertisements (public)
// ==========================
router.get("/", async (req, res) => {
  try {
    const ads = await Advertise.find({ approved: true }).populate("user", "username email");
    res.status(200).json(ads);
  } catch (err) {
    console.error("❌ Advertise fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Get my own advertisements (user dashboard)
// ==========================
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const ads = await Advertise.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(ads);
  } catch (err) {
    console.error("❌ My Advertise fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Delete my own advertisement request
// ==========================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const ad = await Advertise.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });

    if (ad.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await ad.deleteOne();

    // ✅ Notification for requester (নিজের কাছে যাবে)
    await Notification.create({
      user: req.user._id,
      type: "advertise",
      fromUser: req.user._id,
      message: `Your advertise "${ad.title}" has been deleted`,
    });

    res.json({ message: "✅ Advertisement deleted" });
  } catch (err) {
    console.error("❌ Advertise delete error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;