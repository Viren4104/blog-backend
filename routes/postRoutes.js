const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/roleMiddleware');
const postController = require('../controllers/postController');

// ==========================================================
// POSTS CRUD ROUTES (Protected with Permissions)
// ==========================================================

// READ ALL POSTS
// Only users with can_read OR admin
router.get(
  '/',
  verifyToken,
  checkPermission('can_read'),
  postController.getAllPosts
);

// CREATE POST
// Only users with can_create OR admin
router.post(
  '/',
  verifyToken,
  checkPermission('can_create'),
  postController.createPost
);

// UPDATE POST
// Only users with can_edit OR admin
router.put(
  '/:id',
  verifyToken,
  checkPermission('can_edit'),
  postController.updatePost
);

// DELETE POST
// Only users with can_delete OR admin
router.delete(
  '/:id',
  verifyToken,
  checkPermission('can_delete'),
  postController.deletePost
);

module.exports = router;
