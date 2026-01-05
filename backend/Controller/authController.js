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
    { id: user._id, role: user.Role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

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

    // ✅ Use capitalized field name from schema
    const exists = await User.findOne({ Email: Email });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "❌ Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const user = new User({
      Name: Name || "Anonymous",
      Email: Email,
      Password: hashedPassword,
      Role: "user",
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "OMG! You are here ?? Signup successful! Welcome Dear...",
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

    // ✅ Use capitalized field name from schema
    const user = await User.findOne({ Email: Email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "❌ User not found",
      });
    }

    const match = await bcrypt.compare(Password, user.Password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "❌ Login failed. Please check your email and password.",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Yeah! You are back! Login successful! Let's Go...",
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
