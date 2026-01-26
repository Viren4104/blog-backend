const User = require("../models/User");
const jwt = require("jsonwebtoken");

/**
 * @desc Get all users for the admin dashboard
 * @route GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Fetches all users from your Neon DB, ordered by ID
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    console.error("Fetch Users Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * @desc Update specific user permissions
 * @route PATCH /api/admin/users/:userId/permissions
 */
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = req.body; // e.g., { can_edit: true, role: 'admin' }

    // 1. Find user in PostgreSQL
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. 🛡️ Security: Prevent modifying other admins
    // req.user.id comes from your protect middleware
    if (user.role === "admin" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // 3. Update the record in Neon DB
    await user.update(permissions);

    // 4. THE KEY FIX: Generate new JWT if the admin (Viren) updated themselves
    let newToken = null;
    if (req.user.id === parseInt(userId)) {
      newToken = jwt.sign(
        { 
          id: user.id, 
          role: user.role,
          can_edit: user.can_edit,
          can_create: user.can_create 
        },
        process.env.JWT_SECRET, // Use your secret from .env
        { expiresIn: "1d" }
      );
    }

    // 5. 📡 Real-time update via Socket.io
    if (global.io) {
      global.io.to(`user_${userId}`).emit("permissions-updated", {
        updatedPermissions: {
          role: user.role,
          can_create: user.can_create,
          can_edit: user.can_edit,
          can_delete: user.can_delete,
          can_read: user.can_read
        },
        token: newToken, // Send the new token to the frontend
      });
      console.log(`📡 Real-time update pushed to User ${userId}`);
    }

    res.json({ 
      success: true, 
      message: "Permissions updated successfully",
      token: newToken // Return the token to the frontend to prevent logout
    });

  } catch (err) {
    console.error("Update Permissions Error:", err.message);
    res.status(500).json({ message: "Update failed" });
  }
};