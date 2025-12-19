const express = require("express");
const router = express.Router();
const Connect = require("../models/Connect");
const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken"); // ✅ Updated middleware

// ==========================
// ✅ Send LetConnect Request
// ==========================
router.post("/request/:id", verifyToken, async (req, res) => {
  try {
    // Prevent duplicate request
    const existing = await Connect.findOne({
      requester: req.user.id,
      recipient: req.params.id
    });
    if (existing) {
      return res.status(400).json({ error: "Request already sent!" });
    }

    const connect = new Connect({
      requester: req.user.id,
      recipient: req.params.id,
      status: "pending"
    });
    await connect.save();

    res.json({ message: "✅ LetConnect request sent!", connect });
  } catch (err) {
    console.error("❌ Request error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Accept Request
// ==========================
router.post("/accept/:id", verifyToken, async (req, res) => {
  try {
    const connect = await Connect.findById(req.params.id);
    if (!connect) return res.status(404).json({ error: "Request not found" });

    if (connect.recipient.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to accept this request" });
    }

    connect.status = "accepted";
    await connect.save();

    res.json({ message: "✅ Connected successfully!", connect });
  } catch (err) {
    console.error("❌ Accept error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ❌ Reject Request
// ==========================
router.post("/reject/:id", verifyToken, async (req, res) => {
  try {
    const connect = await Connect.findById(req.params.id);
    if (!connect) return res.status(404).json({ error: "Request not found" });

    if (connect.recipient.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized to reject this request" });
    }

    await connect.deleteOne();
    res.json({ message: "❌ Request rejected" });
  } catch (err) {
    console.error("❌ Reject error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Disconnect
// ==========================
router.post("/disconnect/:id", verifyToken, async (req, res) => {
  try {
    await Connect.findOneAndDelete({
      requester: req.user.id,
      recipient: req.params.id,
      status: "accepted"
    });
    await Connect.findOneAndDelete({
      requester: req.params.id,
      recipient: req.user.id,
      status: "accepted"
    });

    res.json({ message: "❌ Disconnected!" });
  } catch (err) {
    console.error("❌ Disconnect error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Get My Connections
// ==========================
router.get("/my-connections", verifyToken, async (req, res) => {
  try {
    const connections = await Connect.find({
      $or: [
        { requester: req.user.id, status: "accepted" },
        { recipient: req.user.id, status: "accepted" }
      ]
    })
      .populate("requester", "username email")
      .populate("recipient", "username email");

    res.json(connections);
  } catch (err) {
    console.error("❌ Connections error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================
// ✅ Get Pending Requests
// ==========================
router.get("/pending", verifyToken, async (req, res) => {
  try {
    const requests = await Connect.find({
      recipient: req.user.id,
      status: "pending"
    }).populate("requester", "username email");

    res.json(requests);
  } catch (err) {
    console.error("❌ Pending error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;