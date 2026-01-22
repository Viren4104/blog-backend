const User = require('../models/User');
const Post = require('../models/Post');

// Get all users with their permissions
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ attributes: { exclude: ['password'] } });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Admin updates user permissions
exports.updateUserPermissions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { can_create, can_edit, can_delete, can_read, role } = req.body;

        await User.update(
            { can_create, can_edit, can_delete, can_read, role },
            { where: { id: userId } }
        );

        res.json({ message: 'Permissions updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};