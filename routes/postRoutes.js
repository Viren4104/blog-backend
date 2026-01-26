const express = require('express');
const router = express.Router();

const { getAllPosts, createPost, updatePost, deletePost } = require('../controllers/postController');

// ✅ FIX: Imported checkPermission
const { protect, checkPermission } = require('../middleware/authMiddleware');

// ==========================================
// POST ROUTES (/api/posts)
// ==========================================

// GET ALL POSTS (Public)
router.get('/', getAllPosts);

// CREATE POST (Protected - requires can_create)
router.post('/', protect, checkPermission('can_create'), createPost);

// EDIT POST (Protected - requires can_edit)
router.put('/:postId', protect, checkPermission('can_edit'), updatePost);

// DELETE POST (Protected - requires can_delete)
router.delete('/:postId', protect, checkPermission('can_delete'), deletePost);

module.exports = router;