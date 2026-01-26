const express = require('express');
const router = express.Router();

/**
 * 🛠️ CONTROLLER IMPORT
 * Ensure ../controllers/postController.js uses 'exports.name' for these functions.
 */
const { 
  getAllPosts, 
  createPost, 
  updatePost, 
  deletePost 
} = require('../controllers/postController');

/**
 * 🛡️ MIDDLEWARE IMPORT
 * These handle JWT verification and RBAC boolean checks (can_create, etc.).
 */
const { protect, checkPermission } = require('../middleware/authMiddleware');

/* ===============================
    POST ROUTES (/api/posts)
================================ */

// 1. Public: Anyone can view blog posts/listings
router.get('/', getAllPosts);

// 2. Protected: Requires valid JWT and 'can_create' permission
router.post(
  '/', 
  protect, 
  checkPermission('can_create'), 
  createPost
);

// 3. Protected: Requires valid JWT and 'can_edit' permission
router.put(
  '/:postId', 
  protect, 
  checkPermission('can_edit'), 
  updatePost
);

// 4. Protected: Requires valid JWT and 'can_delete' permission
router.delete(
  '/:postId', 
  protect, 
  checkPermission('can_delete'), 
  deletePost
);

/**
 * 🚨 CRITICAL FOR RENDER: 
 * Without this export, server.js will see 'postRoutes' as UNDEFINED and crash.
 */
module.exports = router;