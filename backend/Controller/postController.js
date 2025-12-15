const Post = require("../models/Post");

// ✅ Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/posts/${req.file.filename}`;
    }

    const post = new Post({
      owner: req.user.id,
      content,
      image: imagePath,
    });

    await post.save();
    res.status(201).json({ message: "✅ Post created successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get feed (all posts, newest first)
exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("owner", "username profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "✅ Feed fetched successfully", posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }

    res.json({ message: "✅ Post liked", likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Comment on a post
exports.commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ user: req.user.id, text });
    await post.save();

    res.json({ message: "✅ Comment added", comments: post.comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};