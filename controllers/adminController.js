exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const permissions = req.body; // e.g., { can_edit: true, role: 'user' }
 
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    // 1. Update the database in Neon
    await user.update(permissions);
 
    const io = req.app.get("io");
 
    // 2. 🚀 THE FIX: Send the NEW permissions in the emit
    // Also, use a specific room so other users aren't interrupted
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
      console.log(`📡 Live update emitted to user_${userId}`);
    }
 
    res.json({
      message: "Permissions updated successfully",
      user,
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Update failed" });
  }
};