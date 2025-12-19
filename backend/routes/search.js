const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// ✅ Search by Name, Role, Skills (Capitalized fields)
router.get("/", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ error: "Search query required" });
    }

    // case-insensitive regex search
    const regex = new RegExp(q, "i");

    const results = await Profile.find({
      $or: [
        { Name: regex },   // ✅ Capitalized field names
        { Role: regex },
        { Skills: regex }
      ]
    });

    res.json(results);
  } catch (err) {
    console.error("❌ Search error:", err.message);
    res.status(500).json({ error: "Search failed" });
  }
});

module.exports = router;