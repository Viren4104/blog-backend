// middleware/authMiddleware.js
const User = require('../models/User');

// ===============================
// 1. VERIFY SESSION & ATTACH USER
// ===============================
exports.protect = async (req, res, next) => {
  try {
    // ✅ NEW: Check if the session exists
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: No active session' });
    }

    // Fetch live user data
    const user = await User.findByPk(req.session.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error in auth middleware' });
  }
};

// ===============================
// (The rest of your checkPermission and adminOnly functions remain EXACTLY the same!)
// ===============================
// ... paste your existing adminOnly and checkPermission code here ...