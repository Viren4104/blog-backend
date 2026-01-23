const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

// ==========================================================
// ADMIN ROUTES (Admin Only)
// ==========================================================

// GET ALL USERS (Admin Dashboard)
router.get(
  '/users',
  verifyToken,
  isAdmin,
  adminController.getAllUsers
);

// UPDATE USER PERMISSIONS
router.put(
  '/permissions/:userId',
  verifyToken,
  isAdmin,
  adminController.updateUserPermissions
);

module.exports = router;
