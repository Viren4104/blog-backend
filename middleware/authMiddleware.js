const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token and fetch live user data
exports.protect = async (req, res, next) => {
    try {
        let token;

        // 1️⃣ Get token from Authorization header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            token = req.headers.authorization.split(' ')[1];
        }

        // 2️⃣ No token found
        if (!token) {
            return res.status(401).json({
                message: 'Access denied: Token missing'
            });
        }

        // 3️⃣ Verify token validity
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4️⃣ Fetch user from DB (latest role & permissions)
        // This is the secret to fixing the "JWT not changing" issue!
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({
                message: 'Access denied: User not found'
            });
        }

        // 5️⃣ Attach the LIVE user data to the request
        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Access denied: Invalid or expired token'
        });
    }
};

// Admin only middleware
exports.adminOnly = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }
    next();
};