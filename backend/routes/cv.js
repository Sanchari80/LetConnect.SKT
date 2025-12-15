const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const CV = require("../models/cv"); // ✅ CV model import
const User = require("../models/User"); // ✅ User model import
const upload = require("../middleware/upload"); // ✅ Multer middleware
const { uploadCV, deleteCV, getMyCV } = require("../Controller/cvController");

// ==========================
// ✅ CV Upload (replace old if exists)
// ==========================
router.post("/upload", authMiddleware, upload.single("cv"), uploadCV);

// ==========================
// ✅ CV Delete (manual delete option)
// ==========================
router.delete("/delete", authMiddleware, deleteCV);

// ==========================
// ✅ CV Preview route (show CV + cover letter before download)
// ==========================
router.get("/preview/:userId", authMiddleware, async (req, res) => {
  try {
    const cv = await CV.findOne({ user: req.params.userId });
    if (!cv) return res.status(404).json({ message: "CV not found" });

    res.json({
      name: cv.name,
      email: cv.email,
      education: cv.education,
      experience: cv.experience,
      skills: cv.skills,
      coverLetter: cv.coverLetter || "",
    });
  } catch (err) {
    console.error("❌ Error previewing CV:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ==========================
// ✅ CV Download route
// ==========================
router.get("/download/:userId", authMiddleware, async (req, res) => {
  try {
    const cv = await CV.findOne({ user: req.params.userId });
    if (!cv) return res.status(404).json({ message: "CV not found" });

    // ✅ চাইলে এখানে PDF বানিয়ে পাঠাতে পারো
    res.json({
      message: "Download CV",
      cv,
    });
  } catch (err) {
    console.error("❌ Error downloading CV:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ==========================
// ✅ My CV route (for /api/cv/my-cv)
// ==========================
router.get("/my-cv", authMiddleware, getMyCV);

module.exports = router;