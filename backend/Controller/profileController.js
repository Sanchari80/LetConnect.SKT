const path = require("path");
const User = require("../models/User"); // ✅ User model import

// ==========================
// ✅ Get current user's profile
// ==========================
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({
      name: user.name,
      email: user.email,
      profilePhotoUrl: user.profilePhotoUrl || null,
      status: user.status || null,
      statusPhotoUrl: user.statusPhotoUrl || null,
      videos: user.videos || [],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// ==========================
// ✅ Update current user's profile
// ==========================
exports.update = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// ==========================
// ✅ Upload profile image
// ==========================
exports.uploadProfileImage = async (req, res) => {
  try {
    const imageUrl = `/upload/${req.file.filename}`;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.profilePhotoUrl = imageUrl;
    await user.save();

    res.json({ message: "Profile photo uploaded", imageUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload profile photo" });
  }
};

// ==========================
// ✅ Upload status (text only)
// ==========================
exports.uploadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = status;
    await user.save();

    res.json({ message: "Status updated", status });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload status" });
  }
};

// ==========================
// ✅ Upload status with photo
// ==========================
exports.uploadStatusPhoto = async (req, res) => {
  try {
    const { status } = req.body;
    const imageUrl = `/upload/${req.file.filename}`;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = status;
    user.statusPhotoUrl = imageUrl;
    await user.save();

    res.json({ message: "Status with photo uploaded", status, imageUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload status with photo" });
  }
};

// ==========================
// ✅ Upload video
// ==========================
exports.uploadVideo = async (req, res) => {
  try {
    const videoUrl = `/upload/${req.file.filename}`;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.videos) {
      user.videos = [];
    }
    user.videos.push(videoUrl);
    await user.save();

    res.json({ message: "Video uploaded", videoUrl });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload video" });
  }
};