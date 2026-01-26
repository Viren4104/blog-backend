const express = require('express');
const router = express.Router();

/**
 * 🛠️ CONTROLLER IMPORT
 * These functions must be exported using 'exports.name' in postController.js.
 */
const { 
  getAllPosts, 
  createPost, 
  updatePost, 
  deletePost 
} = require('../controllers/postController');

/**
 * 🛡️ MIDDLEWARE IMPORT
 * 'protect' verifies the JWT; 'checkPermission' validates boolean flags (can_create, etc.).
 */
const { protect, checkPermission } = require('../middleware/authMiddleware');

/* ===============================
    POST ROUTES (/api/posts)
================================ */

// 1. Public: Anyone can view blog posts
router.get('/', getAllPosts);

// 2. Protected: Requires 'can_create' permission or 'admin' role
router.post(
  '/', 
  protect, 
  checkPermission('can_create'), 
  createPost
);

// 3. Protected: Requires 'can_edit' permission or 'admin' role
router.put(
  '/:postId', 
  protect, 
  checkPermission('can_edit'), 
  updatePost
);

// 4. Protected: Requires 'can_delete' permission or 'admin' role
router.delete(
  '/:postId', 
  protect, 
  checkPermission('can_delete'), 
  deletePost
);

/**
 * 🚨 CRITICAL FOR RENDER: 
 * This export allows server.js to import the router correctly.
 */
module.exports = router;