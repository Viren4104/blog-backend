const User = require('../models/User');

// Get all users with their permissions
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({ 
            attributes: { exclude: ['password'] }, // Security: Never send passwords
            order: [['id', 'ASC']] // Optional: Keeps the list sorted nicely
        });
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

        // Prevent an Admin from accidentally removing their OWN admin access
        // (Assuming authMiddleware attaches req.user)
        if (req.user && req.user.id == userId && role === 'user') {
             return res.status(400).json({ message: "Safety Alert: You cannot remove your own Admin status!" });
        }

        // Perform the update
        // Sequelize returns an array: [numberOfRowsUpdated]
        const [updatedRows] = await User.update(
            { can_create, can_edit, can_delete, can_read, role },
            { where: { id: userId } }
        );

        // CHECK: Did we actually find and update a user?
        if (updatedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }

        res.json({ message: 'Permissions updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};