const User = require("../models/User");

// 1. PROTECT: Verify Session & Fetch Fresh Data
exports.protect = async (req, res, next) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No session" });
    }

    // 🚀 LIVE SYNC: Pull fresh data so changes are enforced instantly
    const user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // Attach fresh DB state to request
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// 2. ADMIN ONLY: Restrict to Viren/SuperAdmin
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admin only" });
  }
  next();
};

// 3. CHECK PERMISSION: Granular Access
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    if (req.user.role === "admin") return next(); // Admins bypass all
    if (req.user[permission] === true) return next();
    return res.status(403).json({ message: `Missing permission: ${permission}` });
  };
};