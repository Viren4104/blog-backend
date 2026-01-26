// middleware/authMiddleware.js
const User = require("../models/User");

// ===============================
// 1. VERIFY SESSION & ATTACH USER
// ===============================
exports.protect = async (req, res, next) => {
  try {
    // Check if session exists and contains the userId set during login
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No active session" });
    }

    // Fetch latest user data from PostgreSQL (excluding password)
    // This ensures permission changes take effect immediately
    const user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Attach user to the request object for use in controllers
    req.user = user;
    next();
  } catch (err) {
    console.error("PROTECT MIDDLEWARE ERROR:", err);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

// ===============================
// 2. ADMIN ONLY ACCESS
// ===============================
exports.adminOnly = (req, res, next) => {
  // Ensure the user exists and has the 'admin' role
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// ===============================
// 3. GRANULAR PERMISSION CHECK
// ===============================
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const allowedPermissions = [
        "can_create",
        "can_edit",
        "can_delete",
        "can_read",
      ];

      if (!allowedPermissions.includes(permission)) {
        return res.status(400).json({ message: "Invalid permission check" });
      }

      // 🛡️ MASTER ACCESS: Admins like Viren bypass individual permission flags
      if (req.user.role === "admin") return next();
      
      // Check for the specific boolean permission flag on the standard user
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