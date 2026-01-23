const pool = require("../config/db");

// ===============================
// GET ALL USERS (ADMIN)
// ===============================
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, can_create, can_edit, can_delete, can_read
       FROM users
       ORDER BY id ASC`
    );

    res.json(result.rows);
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
    const allowedRoles = ["user", "manager", "admin"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // 2️⃣ Find target user
    const userResult = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [userId]
    );

    if (!userResult.rows.length) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // 3️⃣ Prevent modifying another admin
    if (user.role === "admin" && req.user.id !== user.id) {
      return res.status(403).json({ message: "Cannot modify another admin" });
    }

    // 4️⃣ Prevent admin downgrading self
    if (req.user.id === user.id && role === "user") {
      return res.status(400).json({
        message: "Safety Alert: You cannot remove your own admin access",
      });
    }

    // 5️⃣ Fallback to existing values
    const newRole = role ?? user.role;
    const newCanCreate = can_create ?? user.can_create;
    const newCanEdit = can_edit ?? user.can_edit;
    const newCanDelete = can_delete ?? user.can_delete;
    const newCanRead = can_read ?? user.can_read;

    // 6️⃣ Update user
    const updatedUser = await pool.query(
      `UPDATE users
       SET role = $1, can_create = $2, can_edit = $3, can_delete = $4, can_read = $5
       WHERE id = $6
       RETURNING id, role, can_create, can_edit, can_delete, can_read`,
      [
        newRole,
        newCanCreate,
        newCanEdit,
        newCanDelete,
        newCanRead,
        userId,
      ]
    );

    res.json({
      success: true,
      message: "User permissions updated successfully",
      updatedUser: updatedUser.rows[0],
    });
  } catch (err) {
    console.error("UPDATE PERMISSIONS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
