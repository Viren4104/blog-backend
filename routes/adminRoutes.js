const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  updateUserPermissions
} = require('../controllers/adminController');

const { authenticate, isAdmin } = require('../middlewares/authMiddleware');

// ✅ ALL handlers must be FUNCTIONS
router.get('/users', authenticate, isAdmin, getAllUsers);
router.patch('/users/:userId', authenticate, isAdmin, updateUserPermissions);

module.exports = router;
