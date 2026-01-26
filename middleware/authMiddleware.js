const User = require("../models/User");

// ===============================
// 1. PROTECT: Verify Session & Fetch Fresh Data
// ===============================
exports.protect = async (req, res, next) => {
  try {
    // Check if a session exists and contains a valid userId
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ message: "Unauthorized: No active session" });
    }

    // 🚀 LIVE SYNC: Fetch fresh user data from the DB on every request.
    // This allows permissions (like 'can_edit') to update instantly if an admin changes them.
    const user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ["password"] }, // 🛡️ Security: Never expose the password
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Attach the current database state of the user to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error("PROTECT MIDDLEWARE ERROR:", err);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

// ===============================
// 2. ADMIN ONLY: Restrict Access to Admins (Viren/SuperAdmin)
// ===============================
exports.adminOnly = (req, res, next) => {
  // Ensure the user exists (set by protect) and holds the 'admin' role
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

      // Valid permissions in your Real Estate schema
      const allowedPermissions = [
        "can_create",
        "can_edit",
        "can_delete",
        "can_read",
      ];

      if (!allowedPermissions.includes(permission)) {
        return res.status(400).json({ message: "Invalid permission check" });
      }

      // 🛡️ MASTER ACCESS: Admins like Viren bypass individual permission flags automatically
      if (req.user.role === "admin") return next();
      
      // Check for the specific boolean permission flag on the standard user model
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