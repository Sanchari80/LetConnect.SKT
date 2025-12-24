const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken"); // ✅ Secure middleware

// ==========================
// ✅ Create a post (with anonymous option)
// ==========================
router.post("/", verifyToken, async (req, res) => {
  try {
    const { content, image, anonymous } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Content is required" });
    }

    const post = await Post.create({
      owner: req.user.id,
      content: content.trim(),
      image,
      anonymous: !!anonymous,
    });

    const populated = await post.populate("owner", "username profileImage profession");
    res.status(201).json({ success: true, message: "Post created", post: populated });
  } catch (err) {
    console.error("❌ Create post error:", err.message);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
});

// ==========================
// ✅ Get all posts
// ==========================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("owner", "username profileImage profession");

    res.json({ success: true, posts });
  } catch (err) {
    console.error("❌ Fetch posts error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch posts" });
  }
});

// ==========================
// ✅ Like a post
// ==========================
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();

      await new Notification({
        user: post.owner,
        type: "like",
        fromUser: userId,
        post: post._id,
        message: "liked your post",
      }).save();
    }

    res.json({ success: true, message: "Post liked", post });
  } catch (err) {
    console.error("❌ Like error:", err.message);
    res.status(500).json({ success: false, message: "Failed to like post" });
  }
});

// ==========================
// ✅ Comment on a post
// ==========================
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = { user: userId, text, createdAt: new Date() };
    post.comments.push(comment);
    await post.save();

    await new Notification({
      user: post.owner,
      type: "comment",
      fromUser: userId,
      post: post._id,
      message: "commented on your post",
    }).save();

    res.json({ success: true, message: "Comment added", post });
  } catch (err) {
    console.error("❌ Comment error:", err.message);
    res.status(500).json({ success: false, message: "Failed to comment on post" });
  }
});

// ==========================
// ✅ Share a post
// ==========================
router.post("/:id/share", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    post.shares = (post.shares || 0) + 1;
    await post.save();

    await new Notification({
      user: post.owner,
      type: "share",
      fromUser: userId,
      post: post._id,
      message: "shared your post",
    }).save();

    res.json({ success: true, message: "Post shared", post });
  } catch (err) {
    console.error("❌ Share error:", err.message);
    res.status(500).json({ success: false, message: "Failed to share post" });
  }
});

module.exports = router;