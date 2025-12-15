const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Advertise = require("../models/Advertise"); // ✅ Make sure this model exists

// ==========================
// ✅ Create an advertisement
// ==========================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, link } = req.body;

    const ad = new Advertise({
      user: req.user._id,
      title,
      description,
      link,
    });

    const savedAd = await ad.save();
    res.status(201).json({ message: "✅ Advertisement created", ad: savedAd });
  } catch (err) {
    console.error("❌ Advertise create error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Get all advertisements
// ==========================
router.get("/", async (req, res) => {
  try {
    const ads = await Advertise.find().populate("user", "username email");
    res.status(200).json(ads);
  } catch (err) {
    console.error("❌ Advertise fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Delete an advertisement
// ==========================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const ad = await Advertise.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Advertisement not found" });

    if (ad.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await ad.deleteOne();
    res.json({ message: "✅ Advertisement deleted" });
  } catch (err) {
    console.error("❌ Advertise delete error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;