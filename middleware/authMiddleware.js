// middleware/authMiddleware.js
const User = require('../models/User');

// ===============================
// 1. VERIFY SESSION & ATTACH USER
// ===============================
exports.protect = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Unauthorized: No active session' });
    }

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
// 2. ADMIN ONLY MIDDLEWARE
// ===============================
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

// ===============================
// 3. CHECK SPECIFIC PERMISSION
// ===============================
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const allowedPermissions = ['can_create', 'can_edit', 'can_delete', 'can_read'];
      if (!allowedPermissions.includes(permission)) {
        return res.status(400).json({ message: 'Invalid permission check' });
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.role === 'admin') return next();
      if (user[permission] === true) return next();

      return res.status(403).json({
        message: `Access Denied: Missing permission (${permission})`
      });

    } catch (err) {
      console.error('PERMISSION CHECK ERROR:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
};