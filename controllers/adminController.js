const User = require('../models/User');

// Controller 1: Get All Users
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

// Controller 2: Update User Permissions & Role
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, can_create, can_edit, can_delete, can_read } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Security: Prevent modifying other admins or downgrading yourself
    if (user.role === 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // Dynamic updates
    if (role !== undefined) user.role = role;
    if (can_create !== undefined) user.can_create = can_create;
    if (can_edit !== undefined) user.can_edit = can_edit;
    if (can_delete !== undefined) user.can_delete = can_delete;
    if (can_read !== undefined) user.can_read = can_read;

    await user.save();
    res.json({ success: true, message: "Permissions updated", updatedUser: user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};