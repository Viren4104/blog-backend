const User = require('../models/User');

// ===============================
// GET ALL USERS (ADMIN)
// ===============================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }, // 🔐 never expose passwords
      order: [['id', 'ASC']]
    });

    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================
// UPDATE USER ROLE + PERMISSIONS (ADMIN)
// ===============================
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, can_create, can_edit, can_delete, can_read } = req.body;

    // 1️⃣ Validate role
    const allowedRoles = ['user', 'manager', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 2️⃣ Find target user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3️⃣ Prevent changing another admin
    if (user.role === 'admin' && req.user.id !== user.id) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // 4️⃣ Prevent admin downgrading self
    if (req.user.id === user.id && role === 'user') {
      return res.status(400).json({
        message: "Safety Alert: You cannot remove your own admin access"
      });
    }

    // 5️⃣ Update fields (only if provided)
    if (role !== undefined) user.role = role;
    if (can_create !== undefined) user.can_create = can_create;
    if (can_edit !== undefined) user.can_edit = can_edit;
    if (can_delete !== undefined) user.can_delete = can_delete;
    if (can_read !== undefined) user.can_read = can_read;

    await user.save();

    res.json({
      success: true,
      message: "User permissions updated successfully",
      updatedUser: {
        id: user.id,
        role: user.role,
        can_create: user.can_create,
        can_edit: user.can_edit,
        can_delete: user.can_delete,
        can_read: user.can_read
      }
    });

  } catch (err) {
    console.error("UPDATE PERMISSIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
