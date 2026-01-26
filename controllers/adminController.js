const User = require('../models/User');

// GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// UPDATE ROLE + PERMISSIONS
exports.updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, can_create, can_edit, can_delete, can_read } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({
      role,
      can_create,
      can_edit,
      can_delete,
      can_read
    });

    res.json({ message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};
