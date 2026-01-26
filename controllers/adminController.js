const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ✅ Ensure this name matches the import in adminRoutes.js
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["id", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Ensure this name matches the import in adminRoutes.js
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🛡️ Security: Prevent modifying other admins
    if (user.role === "admin" && req.user.id !== parseInt(userId)) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // Update Neon PostgreSQL record
    await user.update(permissions);

    // 🚀 THE FIX: Generate new JWT if admin updated themselves
    let newToken = null;
    if (req.user.id === parseInt(userId)) {
      newToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
    }

    // 📡 Real-time update via Socket.io
    if (global.io) {
      global.io.to(`user_${userId}`).emit("permissions-updated", {
        updatedPermissions: user,
        token: newToken,
      });
    }

    res.json({ success: true, token: newToken });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};