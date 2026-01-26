const User = require('../models/User');
const jwt = require('jsonwebtoken'); // 1. Import JWT

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

exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = req.body; 

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛡️ Security: Prevent modifying other admins
    if (user.role === 'admin' && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // Save to Neon DB
    await user.update(permissions);

    // 🚀 NEW: Generate fresh token if the admin updated THEMSELVES
    let newToken = null;
    if (req.user.id === parseInt(userId)) {
      newToken = jwt.sign(
        { 
          id: user.id, 
          role: user.role,
          // Include any other permission flags your middleware checks
          can_edit: user.can_edit,
          can_create: user.can_create 
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
    }

    // 🚀 Real-time push logic
    if (global.io) {
      global.io.to(`user_${userId}`).emit("permissions-updated", {
        updatedPermissions: {
          role: user.role,
          can_create: user.can_create,
          can_edit: user.can_edit,
          can_delete: user.can_delete,
          can_read: user.can_read
        },
        newToken: newToken // Also push the token via socket if needed
      });
      console.log(`📡 Real-time update pushed to User ${userId}`);
    }

    // Send the newToken back so the frontend can update localStorage/Context
    res.json({ 
      success: true, 
      user,
      token: newToken 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
};