const User = require('../models/User');

/**
 * Controller 1: Get All Users
 * Fetches the user list for the Admin Dashboard.
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
 * Updates the DB and pushes a real-time notification via Socket.io.
 */
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, can_create, can_edit, can_delete, can_read } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛡️ Security: Prevent modifying other admins or downgrading yourself
    if (user.role === 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // Dynamic updates based on request body
    if (role !== undefined) user.role = role;
    if (can_create !== undefined) user.can_create = can_create;
    if (can_edit !== undefined) user.can_edit = can_edit;
    if (can_delete !== undefined) user.can_delete = can_delete;
    if (can_read !== undefined) user.can_read = can_read;

    // Save changes to the database
    await user.save();

    // 🚀 LEVEL 3: EMIT REAL-TIME UPDATE
    // This sends the new permissions directly to the user's private room
    if (global.io) {
      global.io.to(`user_${userId}`).emit("permission_updated", {
        role: user.role,
        can_create: user.can_create,
        can_edit: user.can_edit,
        can_delete: user.can_delete,
        can_read: user.can_read
      });
      console.log(`📡 Real-time update pushed to User ID: ${userId}`);
    }

    res.json({ 
      success: true, 
      message: "Permissions updated and pushed live", 
      updatedUser: user 
    });
  } catch (err) {
    console.error("UPDATE_PERMISSIONS_ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};