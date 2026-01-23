const User = require('../models/User');

// ===============================
// CHECK SPECIFIC PERMISSION
// Usage: checkPermission('can_create')
// ===============================
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      // 0️⃣ Ensure user is attached (verifyToken must run first)
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // 1️⃣ Validate permission name
      const allowedPermissions = [
        'can_create',
        'can_edit',
        'can_delete',
        'can_read'
      ];

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

      // 5️⃣ Access denied
      return res.status(403).json({
        message: `Access Denied: Missing permission (${permission})`
      });

    } catch (err) {
      console.error('PERMISSION CHECK ERROR:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
};

// ===============================
// ADMIN ONLY MIDDLEWARE
// ===============================
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access Denied: Admin only'
    });
  }
  next();
};
