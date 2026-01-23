const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.verifyToken = async (req, res, next) => {
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

        // 3️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4️⃣ Fetch user from DB (latest role & permissions)
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({
                message: 'Access denied: User not found'
            });
        }

        // 5️⃣ Attach user to request
        req.user = user;

        next();
    } catch (error) {
        return res.status(401).json({
            message: 'Access denied: Invalid or expired token'
        });
    }
};
