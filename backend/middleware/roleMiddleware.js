// ✅ Middleware to check user role
module.exports = function(requiredRole) {
  return (req, res, next) => {
    try {
      // User object থেকে role নাও (ছোট হাতের)
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({ error: "User role not found" });
      }

      // যদি Role match না করে
      if (userRole !== requiredRole) {
        return res
          .status(403)
          .json({ error: `Access denied for role: ${userRole}` });
      }

      // ✅ Role matches, proceed
      next();
    } catch (err) {
      console.error("Role check error:", err.message);
      res.status(500).json({ error: "Role check failed" });
    }
  };
};