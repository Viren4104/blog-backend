const jwt = require("jsonwebtoken");
const User = require("../models/User");

// 🛡️ PROTECT: Verify JWT & Fetch Fresh Data from Neon
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check for token in headers (Standard for JWT)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    // 2. Verify the token using your JWT_SECRET from .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. 🚀 LIVE SYNC: Pull fresh data from Neon DB
    // This ensures that if an admin changed your role, it reflects IMMEDIATELY
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err.message);
    // If token is expired or invalid, send 401 so frontend can handle redirect
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

// adminOnly and checkPermission stay exactly as you have them!