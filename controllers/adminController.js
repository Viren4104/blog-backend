const User = require('../models/User');

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
    const permissions = req.body; // e.g., { can_edit: true }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛡️ Security: Prevent modifying other admins
    if (user.role === 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // Save to Neon DB
    await user.update(permissions);

    // 🚀 LEVEL 3: Use global.io to push changes instantly
    if (global.io) {
      global.io.to(`user_${userId}`).emit("permissions-updated", {
        updatedPermissions: {
          role: user.role,
          can_create: user.can_create,
          can_edit: user.can_edit,
          can_delete: user.can_delete,
          can_read: user.can_read
        }
      });
      console.log(`📡 Real-time update pushed to User ${userId}`);
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};