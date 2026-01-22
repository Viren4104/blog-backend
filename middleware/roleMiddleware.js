const User = require('../models/User');

exports.checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            // 1. Fetch the user's current data from DB
            const user = await User.findByPk(req.user.id);

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // 2. MASTER KEY: If user is 'admin', they get access to EVERYTHING
            // This ensures Admin can edit/delete products even without specific flags
            if (user.role === 'admin') {
                return next();
            }

            // 3. For non-admins, check the specific permission flag
            // e.g., if checking 'can_create', we see if user.can_create is true
            if (user[permission] === true) {
                return next();
            }

            // 4. If neither, deny access
            return res.status(403).json({ 
                message: 'Access Denied: You do not have permission to perform this action.' 
            });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    };
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access Denied: Admin only.' });
    }
    next();
};