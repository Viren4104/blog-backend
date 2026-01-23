const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware 1: verify JWT and get LIVE user data
exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) return res.status(401).json({ message: 'Token missing' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch LIVE user to fix the "JWT not changing" issue
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) return res.status(401).json({ message: 'User not found' });

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware 2: Check if user is an Admin
exports.adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }
    next();
};