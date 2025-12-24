const express = require("express");
const router = express.Router();
const path = require("path");
const multer = require("multer");

const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// ==========================
// ✅ Multer storage (local uploads)
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads")); // /uploads folder
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ==========================
// ✅ Get current user (/me)
// ==========================
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("Name Email Profession Skills ProfileImage CvFile Contact Role Blocked CreatedAt");

    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ /me error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ==========================
// ✅ Get profile by id (/profile/:id)
// ==========================
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("Name Profession Skills ProfileImage CvFile Contact CreatedAt");

    if (!user) return res.status(404).json({ error: "Profile not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ /profile/:id error:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ==========================
// ✅ Update basic info (Name, Profession, Skills, Contact)
// ==========================
router.post("/update", verifyToken, async (req, res) => {
  try {
    const { Name, Profession, Skills, Contact } = req.body;

    const update = {};
    if (Name) update.Name = Name.trim();
    if (Profession) update.Profession = Profession.trim();
    if (Array.isArray(Skills)) update.Skills = Skills.map((s) => String(s).trim());
    if (Contact) update.Contact = Contact.trim();

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true })
      .select("Name Profession Skills ProfileImage CvFile Contact");

    res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("❌ /update error:", err.message);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ==========================
// ✅ Upload profile image (field: profileImage)
// ==========================
router.post("/upload-profile", verifyToken, upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ProfileImage: filePath },
      { new: true }
    ).select("Name ProfileImage");

    res.json({ message: "Profile image uploaded", user });
  } catch (err) {
    console.error("❌ /upload-profile error:", err.message);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
});

// ==========================
// ✅ Upload CV (field: cvFile)
// ==========================
router.post("/upload-cv", verifyToken, upload.single("cvFile"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { CvFile: filePath },
      { new: true }
    ).select("Name CvFile");

    res.json({ message: "CV uploaded", user });
  } catch (err) {
    console.error("❌ /upload-cv error:", err.message);
    res.status(500).json({ error: "Failed to upload CV" });
  }
});

// ==========================
// ✅ Search users (/search?q=...)
// ==========================
router.get("/search", async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: "Search query required" });

    const users = await User.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .select("Name Profession Skills ProfileImage");

    res.json(users);
  } catch (err) {
    console.error("❌ /search error:", err.message);
    res.status(500).json({ error: "Failed to search users" });
  }
});

module.exports = router;