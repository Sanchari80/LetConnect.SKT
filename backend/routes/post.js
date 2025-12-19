const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken"); // ✅ Secure middleware

// ==========================
// ✅ Get all posts
// ==========================
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // latest first
    res.json(posts);
  } catch (err) {
    console.error("❌ Fetch posts error:", err.message);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// ==========================
// ✅ Like a post
// ==========================
router.post("/:id/like", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from token
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // prevent duplicate like
    if (!post.likes.includes(userId)) {
      post.likes.push(userId);
      await post.save();

      // ✅ Trigger notification → post liked
      await new Notification({
        user: post.owner,
        type: "like",
        fromUser: userId,
        post: post._id,
        message: "liked your post",
      }).save();
    }

    res.json({ success: true, post });
  } catch (err) {
    console.error("❌ Like error:", err.message);
    res.status(500).json({ error: "Failed to like post" });
  }
});

// ==========================
// ✅ Comment on a post
// ==========================
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from token
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = { user: userId, text, createdAt: new Date() };
    post.comments.push(comment);
    await post.save();

    // ✅ Trigger notification → post commented
    await new Notification({
      user: post.owner,
      type: "comment",
      fromUser: userId,
      post: post._id,
      message: "commented on your post",
    }).save();

    res.json({ success: true, post });
  } catch (err) {
    console.error("❌ Comment error:", err.message);
    res.status(500).json({ error: "Failed to comment on post" });
  }
});

// ==========================
// ✅ Share a post
// ==========================
router.post("/:id/share", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ from token
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.shares = (post.shares || 0) + 1;
    await post.save();

    // ✅ Trigger notification → post shared
    await new Notification({
      user: post.owner,
      type: "share",
      fromUser: userId,
      post: post._id,
      message: "shared your post",
    }).save();

    res.json({ success: true, post });
  } catch (err) {
    console.error("❌ Share error:", err.message);
    res.status(500).json({ error: "Failed to share post" });
  }
});

module.exports = router;