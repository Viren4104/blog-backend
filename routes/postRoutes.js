const express = require('express');
const router = express.Router();

const {
  getAllPosts,
  createPost,
  updatePost,
  deletePost
} = require('../controllers/postController');

const { protect } = require('../middleware/authMiddleware');

// ===============================
// POST ROUTES (/api/posts)
// ===============================

// Public
router.get('/', getAllPosts);

// Protected
router.post('/', protect, createPost);
router.put('/:postId', protect, updatePost);
router.delete('/:postId', protect, deletePost);

module.exports = router;
