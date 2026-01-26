const express = require('express');
const router = express.Router();

// 1. Import your controllers
const { 
  getAllPosts, 
  createPost, 
  updatePost, 
  deletePost 
} = require('../controllers/postController');

// 2. Import your verified middleware
const { protect, checkPermission } = require('../middleware/authMiddleware');

/* ===============================
    POST ROUTES
================================ */

// Public: Anyone can view listings
router.get('/', getAllPosts);

// Protected: Requires specific RBAC permissions
router.post('/', protect, checkPermission('can_create'), createPost);
router.put('/:postId', protect, checkPermission('can_edit'), updatePost);
router.delete('/:postId', protect, checkPermission('can_delete'), deletePost);

// 🚨 CRITICAL FIX: Render cannot see the routes without this line
module.exports = router;