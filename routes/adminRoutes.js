const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

// All routes here require the user to be Logged In (verifyToken) AND be an Admin (isAdmin)

// GET /api/admin/users
// Dashboard View: Admin sees all users to manage them
router.get('/users', verifyToken, isAdmin, adminController.getAllUsers);

// PUT /api/admin/permissions/:userId
// Action: Admin grants or revokes permissions (can_create, can_delete, etc.)
router.put('/permissions/:userId', verifyToken, isAdmin, adminController.updateUserPermissions);

module.exports = router;