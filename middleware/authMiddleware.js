const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(req.body);

    // Generate new token if admin updates themselves to prevent logout
    let newToken = null;
    if (req.user.id === parseInt(userId)) {
      newToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
    }

    // 📡 SOCKET.IO REAL-TIME PUSH
    if (global.io) {
      global.io.to(`user_${userId}`).emit("permissions-updated", {
        updatedPermissions: {
          can_create: user.can_create,
          can_edit: user.can_edit,
          can_delete: user.can_delete,
          role: user.role
        },
        token: newToken // Frontend swaps the token in localStorage
      });
    }

    res.json({ success: true, token: newToken });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};