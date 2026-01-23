const express = require('express');
const router = express.Router();

// ✅ Now importing all 4 functions from your updated controller
const { getAllPosts, createPost, updatePost, deletePost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// POST ROUTES (/api/posts)
// ==========================================

// GET ALL POSTS (Public)
// Endpoint: GET /api/posts
router.get('/', getAllPosts);

// CREATE POST (Protected - requires can_create)
// Endpoint: POST /api/posts
router.post('/', protect, createPost);

// ✅ NEW: EDIT POST (Protected - requires can_edit)
// Endpoint: PUT /api/posts/:postId
router.put('/:postId', protect, updatePost);

// ✅ NEW: DELETE POST (Protected - requires can_delete)
// Endpoint: DELETE /api/posts/:postId
router.delete('/:postId', protect, deletePost);

module.exports = router;