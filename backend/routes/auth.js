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
  return res.status(403).json({ success: false, message: "Forbidden: Admins only" });
}

// ==========================
// ✅ Signup
// ==========================
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne(caseInsensitiveEmailQuery(email));
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
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

    res.status(201).json({ success: true, message: "Signup successful", token, user: safeUser });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
});

// ==========================
// ✅ Login
// ==========================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    console.log("Login attempt:", email);

    const user = await User.findOne(caseInsensitiveEmailQuery(email));
    if (!user) {
      console.log("❌ No user found for:", email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = signJwt({ id: user._id, email: user.email, role: user.role });
    const safeUser = await sanitizeUser(user._id);

    res.json({ success: true, message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// ==========================
// ✅ Get Current User
// ==========================
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await sanitizeUser(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Me route error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
});

// ==========================
// ✅ Change Password
// ==========================
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both old and new password required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error("❌ Change password error:", err.message);
    res.status(500).json({ success: false, message: "Password change failed" });
  }
});

// ==========================
// ✅ Forgot Password
// ==========================
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne(caseInsensitiveEmailQuery(email));
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

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

    res.json({ success: true, message: "Reset link sent to your email" });
  } catch (err) {
    console.error("❌ Forgot password error:", err.message);
    res.status(500).json({ success: false, message: "Failed to send reset link" });
  }
});

// ==========================
// ✅ Reset Password
// ==========================
router.put("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ success: false, message: "New password is required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Reset password error:", err.message);
    res.status(500).json({ success: false, message: "Failed to reset password" });
  }
});

// ==========================
// ✅ Admin-only Example Route
// ==========================
router.get("/admin/dashboard", verifyToken, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, message: "Admin dashboard", users });
  } catch (err) {
    console.error("❌ Admin route error:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch admin data" });
  }
});

module.exports = router;