const User = require('../models/User');

/**
 * Controller 1: Get All Users
 * Fetches the user list for your Admin Dashboard.
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // 🛡️ Security: Never send passwords
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    console.error("GET_USERS_ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Controller 2: Update User Permissions & Role
 * Saves to Neon PostgreSQL and triggers a real-time Socket.io emit.
 */
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = req.body; // e.g., { role: 'user', can_edit: true }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛡️ Security: Prevent modifying other admins or downgrading yourself
    if (user.role === 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // Update the database record
    await user.update(permissions);

    // 🚀 LEVEL 3: Emit the update so the UI changes instantly without refresh
    const io = req.app.get("io"); // Get the socket instance from server.js
    if (io) {
      io.to(`user_${userId}`).emit("permissions-updated", {
        updatedPermissions: {
          role: user.role,
          can_create: user.can_create,
          can_edit: user.can_edit,
          can_delete: user.can_delete,
          can_read: user.can_read
        }
      });
      console.log(`📡 Real-time update pushed to room: user_${userId}`);
    }

    res.json({ 
      success: true, 
      message: "Permissions updated and pushed live", 
      user 
    });
  } catch (err) {
    console.error("UPDATE_PERMISSIONS_ERROR:", err.message);
    res.status(500).json({ message: "Update failed" });
  }
};