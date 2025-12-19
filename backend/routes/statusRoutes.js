const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken"); // ✅ Updated middleware
const upload = require("../middleware/upload");
const Status = require("../models/Status");

// ✅ Create Status (text + image/video)
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "Image", maxCount: 5 },
    { name: "Video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const images = req.files?.Image
        ? req.files.Image.map((file) => `/uploads/status/${file.filename}`)
        : [];

      const video = req.files?.Video
        ? `/uploads/status/${req.files.Video[0].filename}`
        : "";

      const newStatus = new Status({
        UserId: req.user.id,
        Text: req.body.Text,
        Image: images,
        Video: video,
      });

      const savedStatus = await newStatus.save();
      res.json({ message: "✅ Status created!", status: savedStatus });
    } catch (err) {
      console.error("❌ Status error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ Upload only images
router.post(
  "/upload-images",
  verifyToken,
  upload.array("Image", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      const images = req.files.map((file) => `/uploads/status/${file.filename}`);
      const newStatus = new Status({
        UserId: req.user.id,
        Text: req.body.Text || "",
        Image: images,
      });

      const savedStatus = await newStatus.save();
      res.json({ message: "✅ Images uploaded!", status: savedStatus });
    } catch (err) {
      console.error("❌ Image upload error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ Upload only video
router.post(
  "/upload-video",
  verifyToken,
  upload.single("Video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No video uploaded" });
      }

      const video = `/uploads/status/${req.file.filename}`;
      const newStatus = new Status({
        UserId: req.user.id,
        Text: req.body.Text || "",
        Video: video,
      });

      const savedStatus = await newStatus.save();
      res.json({ message: "✅ Video uploaded!", status: savedStatus });
    } catch (err) {
      console.error("❌ Video upload error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ✅ Get Feed
router.get("/", verifyToken, async (req, res) => {
  try {
    const statuses = await Status.find()
      .populate("UserId", "username email profileImage")
      .populate("Likes", "username email")
      .populate("Comments.user", "username email")
      .populate("Shares", "username email")
      .sort({ createdAt: -1 });

    res.json(statuses);
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get My Statuses
router.get("/my-statuses", verifyToken, async (req, res) => {
  try {
    const statuses = await Status.find({ UserId: req.user.id })
      .populate("Likes", "username email")
      .populate("Comments.user", "username email")
      .populate("Shares", "username email")
      .sort({ createdAt: -1 });

    res.json(statuses);
  } catch (err) {
    console.error("❌ My statuses fetch error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Like / Unlike
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: "Status not found" });

    const userId = req.user.id;
    if (status.Likes.includes(userId)) {
      status.Likes = status.Likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      await status.save();
      return res.json({ message: "❌ Unliked", likes: status.Likes });
    }

    status.Likes.push(userId);
    await status.save();
    res.json({ message: "✅ Liked", likes: status.Likes });
  } catch (err) {
    console.error("❌ Like error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Comment
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    if (!req.body.text || req.body.text.trim() === "") {
      return res.status(400).json({ error: "Comment text required" });
    }

    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: "Status not found" });

    status.Comments.push({ user: req.user.id, text: req.body.text });
    await status.save();

    res.json({ message: "✅ Comment added", comments: status.Comments });
  } catch (err) {
    console.error("❌ Comment error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Share / Unshare
router.post("/:id/share", verifyToken, async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: "Status not found" });

    const userId = req.user.id;
    if (status.Shares.includes(userId)) {
      status.Shares = status.Shares.filter(
        (id) => id.toString() !== userId.toString()
      );
      await status.save();
      return res.json({ message: "❌ Unshared", shares: status.Shares });
    }

    status.Shares.push(userId);
    await status.save();
    res.json({ message: "✅ Shared", shares: status.Shares });
  } catch (err) {
    console.error("❌ Share error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;