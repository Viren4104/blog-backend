const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Fetch all users for the admin dashboard
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update permissions and refresh the admin token
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = req.body; 

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Security: Prevent modifying other admins
    if (user.role === 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // 1. Update Neon PostgreSQL record
    await user.update(permissions);

    // 2. THE FIX: Create a fresh token if the admin updated THEMSELVES
    let newToken = null;
    if (req.user.id === parseInt(userId)) {
      newToken = jwt.sign(
        { 
          id: user.id, 
          role: user.role,
          can_edit: user.can_edit,
          can_create: user.can_create 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
    }

    // 3. Real-time push via Socket.io
    if (global.io) {
      global.io.to(`user_${userId}`).emit("permissions-updated", {
        updatedPermissions: {
          role: user.role,
          can_create: user.can_create,
          can_edit: user.can_edit,
          can_delete: user.can_delete,
          can_read: user.can_read
        },
        token: newToken 
      });
    }

    res.json({ 
      success: true, 
      message: "Permissions updated",
      token: newToken // Frontend must swap the old token with this one
    });

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};