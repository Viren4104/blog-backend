const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🛡️ PROTECT: Verify JWT & Fetch Fresh Data from Neon DB
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for Bearer token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // Verify token using your JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user data to stay in sync with database changes
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) return res.status(401).json({ message: "User no longer exists" });

    req.user = user; // Attach user to request for use in checkPermission
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

// 🛡️ ADMIN ONLY: Simple role check
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admin only" });
  }
  next();
};

// 🛡️ CHECK PERMISSION: The function your route is looking for
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