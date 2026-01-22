const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route: POST /api/auth/register
// Description: Registers a new default user (User role, limited permissions)
router.post('/register', authController.register);

// Route: POST /api/auth/login
// Description: Authenticates user and returns JWT + Role for redirection
router.post('/login', authController.login);

module.exports = router;