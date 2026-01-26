const User = require('../models/User');

// Controller 1: Get All Users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // 🛡️ Fetches all users from Neon PostgreSQL for the admin list
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // Never send passwords to the frontend
      order: [['id', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    console.error("GET_ALL_USERS_ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller 2: Update User Permissions & Role
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, can_create, can_edit, can_delete, can_read } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛡️ Security Check: Prevent changing another admin or downgrading self
    if (user.role === 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }
    if (req.user.id === user.id && role === 'user') {
      return res.status(400).json({ message: "Cannot remove your own admin access" });
    }

    // Update fields dynamically based on the request body
    if (role !== undefined) user.role = role;
    if (can_create !== undefined) user.can_create = can_create;
    if (can_edit !== undefined) user.can_edit = can_edit;
    if (can_delete !== undefined) user.can_delete = can_delete;
    if (can_read !== undefined) user.can_read = can_read;

    // Save changes to the Neon database
    await user.save();

    // 🚀 Return success and the updated user so the frontend updates instantly
    res.json({ 
      success: true, 
      message: "Permissions updated successfully",
      updatedUser: {
        id: user.id,
        username: user.username,
        role: user.role,
        can_create: user.can_create,
        can_edit: user.can_edit,
        can_delete: user.can_delete,
        can_read: user.can_read
      }
    });
  } catch (err) {
    console.error("UPDATE_PERMISSIONS_ERROR:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};