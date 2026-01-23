const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// ==========================================================
// AUTH ROUTES
// ==========================================================

// REGISTER USER
// POST /api/auth/register
router.post('/register', authController.register);

// LOGIN USER
// POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
