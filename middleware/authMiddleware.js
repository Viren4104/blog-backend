const User = require("../models/User");

/**
 * 1. PROTECT: Verify Session & Fetch Fresh Data
 * This is the "Live Sync" that prevents stale permissions.
 */
exports.protect = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No active session" });
    }

    // 🚀 Fetches fresh data on every request to handle real-time changes
    const user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(401).json({ message: "User no longer exists" });

    req.user = user;
    next();
  } catch (err) {
    console.error("PROTECT_ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 2. ADMIN ONLY: Restrict to SuperAdmin/Viren
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admin access only" });
  }
  next();
};

/**
 * 3. CHECK PERMISSION: Granular Access Control
 * Allows admins to bypass flags while checking specific user rights.
 */
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      // 🛡️ Master Access: Admins bypass individual flags
      if (req.user.role === "admin") return next();
      
      // Check the boolean flag in the user record
      if (req.user[permission] === true) return next();

      return res.status(403).json({ message: `Access Denied: ${permission}` });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };
};