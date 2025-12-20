const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const User = require("../models/User");
const verifyToken = require("../middleware/verifyToken");

// ==========================
// ✅ Helpers
// ==========================
const signJwt = (payload, expiresIn = "7d") =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });

const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const caseInsensitiveEmailQuery = (email) => ({
  email: new RegExp("^" + escapeRegex(email) + "$", "i"),
});

const sanitizeUser = async (id) => User.findById(id).select("-password");

// ✅ Admin guard
function checkAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ error: "Forbidden: Admins only" });
}

// ==========================
// ✅ Signup
// ==========================
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne(caseInsensitiveEmailQuery(email));
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
    });

    await user.save();
    const safeUser = await sanitizeUser(user._id);

    const token = signJwt({ id: user._id, email: user.email, role: user.role });

    res.status(201).json({ message: "✅ Signup successful", token, user: safeUser });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ==========================
// ✅ Login
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    console.log("Login attempt:", email);

    const user = await User.findOne(caseInsensitiveEmailQuery(email));
    if (!user) {
      console.log("❌ No user found for:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = signJwt({ id: user._id, email: user.email, role: user.role });
    const safeUser = await sanitizeUser(user._id);

    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
});

// ==========================
// ✅ Get Current User
// ==========================
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await sanitizeUser(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ Me route error:", err.message);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ==========================
// ✅ Change Password
// ==========================
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both old and new password required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "✅ Password changed successfully" });
  } catch (err) {
    console.error("❌ Change password error:", err.message);
    res.status(500).json({ error: "Password change failed" });
  }
});

// ==========================
// ✅ Forgot Password
// ==========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne(caseInsensitiveEmailQuery(email));
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = signJwt({ id: user._id }, "1h");
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Click here to reset your password: ${resetLink}`,
    });

    res.json({ message: "✅ Reset link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ error: "Failed to send reset link" });
  }
});

// ==========================
// ✅ Reset Password
// ==========================
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ error: "New password is required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "✅ Password reset successful" });
  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// ==========================
// ✅ Admin-only Example Route
// ==========================
router.get("/admin/dashboard", verifyToken, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ message: "✅ Admin dashboard", users });
  } catch (err) {
    console.error("❌ Admin route error:", err.message);
    res.status(500).json({ error: "Failed to fetch admin data" });
  }
});

module.exports = router;