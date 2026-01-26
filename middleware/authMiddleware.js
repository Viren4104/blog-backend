const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * 🛡️ PROTECT: Verify JWT & Fetch Fresh Data
 * This replaces session-based auth for Render stability.
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in Authorization headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token using JWT_SECRET from your .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🚀 LIVE SYNC: Pull fresh data from Neon DB
    // This ensures permissions update instantly after an admin change
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(401).json({ message: "User no longer exists" });

    // Attach user record to request for downstream middleware
    req.user = user; 
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

/**
 * 🛡️ ADMIN ONLY: Restrict to SuperAdmin (Viren)
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admin access only" });
  }
  next();
};

/**
 * 🛡️ CHECK PERMISSION: Higher-Order Function for granular access
 * Usage in routes: checkPermission('can_create')
 */
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    // 1. Admins automatically pass all checks
    if (req.user.role === "admin") return next();

    // 2. Check the specific boolean permission field in the User model
    if (req.user[permission] === true) {
      return next();
    }

    // 3. Deny access if permission is false or missing
    return res.status(403).json({ 
      message: `Access Denied: You do not have the ${permission} permission` 
    });
  };
};