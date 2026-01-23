const User = require("../models/User");

/**
 * ✅ Get all users (Admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // 🔐 Auth check (prevents crash)
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: Token missing or invalid",
      });
    }

    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/**
 * ✅ Update user role & permissions (Admin only)
 */
exports.updateUserPermissions = async (req, res) => {
  try {
    // 🔐 VERY IMPORTANT GUARD (fixes your 500 error)
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: Token missing or invalid",
      });
    }

    const { userId } = req.params;
    const { role, can_create, can_edit, can_delete, can_read } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Update role & permissions
    user.role = role ?? user.role;
    user.can_create = can_create ?? user.can_create;
    user.can_edit = can_edit ?? user.can_edit;
    user.can_delete = can_delete ?? user.can_delete;
    user.can_read = can_read ?? user.can_read;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User permissions updated successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: {
          can_create: user.can_create,
          can_edit: user.can_edit,
          can_delete: user.can_delete,
          can_read: user.can_read,
        },
      },
    });
  } catch (error) {
    console.error("Update Permissions Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update permissions",
    });
  }
};

/**
 * ✅ Delete user (Admin only)
 */
exports.deleteUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: Token missing or invalid",
      });
    }

    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};
