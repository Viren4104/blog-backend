const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    try {
        // 1. Get the header (Handles both 'Authorization' and 'authorization')
        const authHeader = req.header('Authorization');

        // 2. Check if header exists
        if (!authHeader) {
            return res.status(401).json({ message: 'Access Denied: No Token Provided' });
        }

        // 3. Robust Extraction: Splits "Bearer <token>" and takes the second part
        // This prevents issues if the "Bearer" casing is different or missing
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7, authHeader.length) 
            : authHeader;

        if (!token) {
            return res.status(401).json({ message: 'Access Denied: Malformed Token' });
        }

        // 4. Verify Token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Attach user payload
        next();

    } catch (err) {
        // 5. Better Error Handling
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session Expired: Please Login Again' });
        }
        res.status(400).json({ message: 'Invalid Token' });
    }
};