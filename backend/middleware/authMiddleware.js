const jwt = require("jsonwebtoken");
const User = require("../models/User"); // ✅ User model import

// ✅ Authentication Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Token verify করো
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded._id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // ✅ Database থেকে user খুঁজে বের করো
    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // User info request এ attach করো
    req.user = user;

    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;