const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ==========================
// ✅ Helper: Generate JWT
// ==========================
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // 7 days expiry
  );
};

// ==========================
// ✅ Signup Controller
// ==========================
exports.signup = async (req, res) => {
  try {
    console.log("📩 Signup REQ BODY:", req.body);

    const { name, email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user (always role=user)
    const user = new User({
      name: name || "Anonymous",
      email,
      password: hashedPassword,
      role: "user", // 👈 enforce user role
    });

    await user.save();

    // Generate JWT
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
};

// ==========================
// ✅ Login Controller
// ==========================
exports.login = async (req, res) => {
  try {
    console.log("📩 Login REQ BODY:", req.body);

    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // Generate JWT
    const token = generateToken(user);

    res.json({
      success: true,
      message: ""OMG! You come back ,Really! Login successful! Let's Go..."",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};