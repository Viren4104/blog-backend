const User = require("../models/User");

// ===============================
// 1. PROTECT: Verify Session & Fetch Fresh Data
// ===============================
exports.protect = async (req, res, next) => {
  try {
    // Check if session exists and contains the userId set during login
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No active session" });
    }

    // 🚀 THE NO-REFRESH FIX: Fetch fresh user data from the DB on every request.
    // This ensures permissions like 'can_edit' update live if changed by an admin.
    const user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Attach fresh user object to the request for use in controllers
    req.user = user;
    next();
  } catch (err) {
    console.error("PROTECT MIDDLEWARE ERROR:", err);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

// ===============================
// 2. ADMIN ONLY: Restrict to SuperAdmin/Viren
// ===============================
exports.adminOnly = (req, res, next) => {
  // Ensure the user exists (from protect) and has the 'admin' role
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admin access only" });
  }
  next();
};

// ===============================
// 3. CHECK PERMISSION: Granular Access Control
// ===============================
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // 🛡️ MASTER ACCESS: Admins like Viren bypass individual permission flags
      if (req.user.role === "admin") return next();
      
      // Check for the specific boolean permission flag (e.g., 'can_create')
      if (req.user[permission] === true) return next();

      return res.status(403).json({
        message: `Access Denied: Missing permission (${permission})`,
      });
    } catch (err) {
      console.error("PERMISSION CHECK ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};