// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// ✅ NEW: Logout Route
router.post('/logout', protect, authController.logout);

// GET CURRENT USER (Protected)
router.get("/me", protect, (req, res) => {
  res.json(req.user); // req.user is already fetched in 'protect'
});

module.exports = router;