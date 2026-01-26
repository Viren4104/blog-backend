const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ===============================
// 1. VERIFY JWT & ATTACH USER
// ===============================
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
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
      // 0️⃣ Ensure user is attached
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // 1️⃣ Validate permission name
      const allowedPermissions = ['can_create', 'can_edit', 'can_delete', 'can_read'];
      if (!allowedPermissions.includes(permission)) {
        return res.status(400).json({ message: 'Invalid permission check' });
      }

      // 2️⃣ Fetch latest user data from DB
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // 3️⃣ MASTER ACCESS: Admin can do everything
      if (user.role === 'admin') {
        return next();
      }

      // 4️⃣ Check specific permission flag
      if (user[permission] === true) {
        return next();
      }

      // 5️⃣ Access denied (FIXED BACKTICKS HERE)
      return res.status(403).json({
        message: `Access Denied: Missing permission (${permission})`
      });

    } catch (err) {
      console.error('PERMISSION CHECK ERROR:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
};