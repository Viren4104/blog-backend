const express = require('express');
const router = express.Router();
const { protect, checkPermission } = require('../middleware/authMiddleware'); // Verify this path!
const postController = require('../controllers/postController');

// Example usage on line 16
router.post(
  '/', 
  protect, 
  checkPermission('can_create'), // This is where the error was happening
  postController.createPost
);

module.exports = router;