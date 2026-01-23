const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Import your auth middleware
const User = require('../models/User'); // Import your User model

// ==========================================================
// AUTH ROUTES
// ==========================================================

// REGISTER USER
// POST /api/auth/register
router.post('/register', authController.register);

// LOGIN USER
// POST /api/auth/login
router.post('/login', authController.login);

// ==========================================================
// GET CURRENT USER (LIVE DB DATA)
// GET /api/auth/me
// ==========================================================
router.get("/me", protect, async (req, res) => {
  try {
    // req.user.id comes from the 'protect' middleware
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] }, // Don't send the password back!
    });
 
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
 
    res.json(user);
  } catch (err) {
    console.error("AUTH ME ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

module.exports = router;