const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// 🔍 DEBUG: If these log as false on Render, your file path or naming is wrong
console.log("Auth Controller Handlers:", {
  register: !!authController.register,
  login: !!authController.login,
  logout: !!authController.logout
});

// Use conditional registration to prevent the crash if a function is missing
if (authController.register) router.post('/register', authController.register);
if (authController.login) router.post('/login', authController.login);
if (authController.logout) router.post('/logout', protect, authController.logout);

router.get("/me", protect, (req, res) => {
  res.json(req.user); 
});

module.exports = router;