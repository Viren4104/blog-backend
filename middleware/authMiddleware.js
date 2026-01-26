const User = require("../models/User");

// 1. PROTECT: Verify Session & Fetch Fresh Data
exports.protect = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No active session" });
    }

    // Fetch fresh data so permissions update live without a refresh
    const user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(401).json({ message: "User no longer exists" });

    req.user = user;
    next();
  } catch (err) {
    console.error("PROTECT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. ADMIN ONLY: Restrict to SuperAdmin/Viren
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admin access only" });
  }
  next();
};

// 3. CHECK PERMISSION: Granular Access Control
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ message: "Unauthorized" });

      // Admins bypass all individual permission flags
      if (req.user.role === "admin") return next();
      
      if (req.user[permission] === true) return next();

      return res.status(403).json({ message: `Missing permission: ${permission}` });
    } catch (err) {
      res.status(500).json({ message: "Server error" });
    }
  };
};