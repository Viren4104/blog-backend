const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Check this path!

// Auth Routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Line 16 FIX: Ensure protect is a function before calling .post
if (typeof protect === 'function') {
    router.post('/logout', protect, authController.logout);
} else {
    console.error("❌ ERROR: 'protect' middleware is undefined in authRoutes.js");
}

router.get("/me", protect, (req, res) => {
  res.json(req.user); 
});

module.exports = router;