const User = require("../models/User");
const bcrypt = require("bcryptjs"); // ✅ use bcryptjs everywhere
const jwt = require("jsonwebtoken");

// ==========================
// ✅ Helper: Generate JWT
// ==========================
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign(
    { id: user._id, role: user.Role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ Case-insensitive Email query
const caseInsensitiveEmailQuery = (email) => ({
  Email: new RegExp("^" + email + "$", "i"),
});

// ==========================
// ✅ Signup Controller
// ==========================
exports.signup = async (req, res) => {
  try {
    console.log("📩 Signup REQ BODY:", req.body);

    const { Name, Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: "❌ All fields are required",
      });
    }

    const exists = await User.findOne(caseInsensitiveEmailQuery(Email));
    console.log("🔍 Existing user check:", exists);

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "❌ Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const user = new User({
      Name: Name || "Anonymous",
      Email,
      Password: hashedPassword,
      Role: "user",
    });

    await user.save();
    console.log("✅ New user saved:", user);

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "🎉 Signup successful! Welcome aboard, vibe coder!",
      token,
      user: {
        id: user._id,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
      },
    });
  } catch (err) {
    console.error("❌ Signup error:", err.message);
    res.status(500).json({
      success: false,
      message: "❌ Signup failed: Please try again.",
    });
  }
};

// ==========================
// ✅ Login Controller
// ==========================
exports.login = async (req, res) => {
  try {
    console.log("📩 Login REQ BODY:", req.body);

    const { Email, Password } = req.body;

    if (!Email || !Password) {
      return res.status(400).json({
        success: false,
        message: "❌ All fields are required",
      });
    }

    console.log("Login attempt with Email:", Email);

    const user = await User.findOne(caseInsensitiveEmailQuery(Email));
    console.log("User found in DB:", user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ User not found",
      });
    }

    const match = await bcrypt.compare(Password, user.Password);
    console.log("Password match result:", match);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "❌ Login failed. Please check your email and password.",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "💚 Login successful! Welcome back, vibe coder!",
      token,
      user: {
        id: user._id,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({
      success: false,
      message: "❌ Login failed: Please try again.",
    });
  }
};
