const express = require('express');
const router = express.Router();

const { getAllPosts, createPost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// ==========================================
// POST ROUTES (/api/posts)
// ==========================================

// GET ALL POSTS (Public or protected depending on your needs)
// Line 14 is now safely connected to getAllPosts
router.get('/', getAllPosts);

// CREATE POST (Protected - Requires auth)
router.post('/', protect, createPost);

module.exports = router;