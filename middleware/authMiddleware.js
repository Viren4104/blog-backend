const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
// Verify JWT & attach LIVE user
exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
 
    if (!token) {
      return res.status(401).json({ message: 'Token missing' });
    }
 
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
 
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });
 
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
 
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
 
// Admin-only
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};