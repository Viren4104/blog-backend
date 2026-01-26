const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getProfile
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ===============================
// AUTH ROUTES (/api/auth)
// ===============================

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Get logged-in user profile
router.get('/me', protect, getProfile);

module.exports = router;
