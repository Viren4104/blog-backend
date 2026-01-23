const express = require('express');
const router = express.Router();

// ✅ All names perfectly match the exports from middleware & controller
const { getAllUsers, updateUserPermissions } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ==========================================
// ADMIN ROUTES (/api/admin)
// ==========================================

// GET ALL USERS
router.get("/users", protect, adminOnly, getAllUsers);

// UPDATE USER PERMISSIONS
router.patch("/users/:userId/permissions", protect, adminOnly, updateUserPermissions);

module.exports = router;