const CV = require("../models/CV"); // ✅ Case-sensitive import
const path = require("path");
const fs = require("fs");

// ==========================
// ✅ Upload CV (replace old if exists)
// ==========================
const uploadCV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "CV file is required" });
    }

    // পুরনো CV থাকলে delete করো
    const oldCv = await CV.findOne({ user: req.user.id });
    if (oldCv) {
      // পুরনো ফাইল delete করো (optional)
      const oldPath = path.join(__dirname, "../uploads/cv", path.basename(oldCv.file));
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      await CV.findOneAndDelete({ user: req.user.id });
    }

    // নতুন CV save করো
    const newCv = new CV({
      user: req.user.id,
      file: `/uploads/cv/${req.file.filename}`,
      name: req.body.name || "",
      email: req.body.email || "",
      education: req.body.education || "",
      experience: req.body.experience || "",
      skills: req.body.skills ? req.body.skills.split(",") : [],
      coverLetter: req.body.coverLetter || "",
    });

    await newCv.save();

    res.json({
      message: "✅ CV uploaded successfully (old CV replaced if existed)",
      cv: newCv,
    });
  } catch (error) {
    console.error("❌ CV upload error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ==========================
// ✅ Delete CV
// ==========================
const deleteCV = async (req, res) => {
  try {
    const cv = await CV.findOne({ user: req.user.id });
    if (!cv) {
      return res.status(404).json({ error: "No CV found to delete" });
    }

    // পুরনো ফাইল delete করো (optional)
    const oldPath = path.join(__dirname, "../uploads/cv", path.basename(cv.file));
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }

    await CV.findOneAndDelete({ user: req.user.id });

    res.json({ message: "✅ CV deleted successfully" });
  } catch (error) {
    console.error("❌ CV delete error:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

// ==========================
// ✅ Get My CV
// ==========================
const getMyCV = async (req, res) => {
  try {
    const cv = await CV.findOne({ user: req.user.id });
    if (!cv) {
      return res.json({ message: "No CV uploaded yet", cv: null });
    }

    res.json({ message: "✅ CV fetched successfully", cv });
  } catch (error) {
    console.error("❌ Error fetching CV:", error.message);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { uploadCV, deleteCV, getMyCV };