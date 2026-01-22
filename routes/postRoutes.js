const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/roleMiddleware');
const postController = require('../controllers/postController');

// ==========================================================
// CRUD Operations (Create, Read, Update, Delete)
// ==========================================================

// 1. READ (Public or Private depending on your need)
// We use 'can_read' so the Admin can ban specific users from even seeing content if needed
router.get('/', 
    verifyToken, 
    checkPermission('can_read'), 
    postController.getAllPosts
);

// 2. CREATE (Add new product/blog)
// Only users with 'can_create' (or Admins) can access
router.post('/', 
    verifyToken, 
    checkPermission('can_create'), 
    postController.createPost
);

// 3. EDIT (Update existing product/blog)
// Only users with 'can_edit' (or Admins) can access
router.put('/:id', 
    verifyToken, 
    checkPermission('can_edit'), 
    // You might want to add logic in controller to ensure users only edit their OWN posts,
    // unless they are Admin.
    postController.updatePost 
);

// 4. DELETE (Remove product/blog)
// Only users with 'can_delete' (or Admins) can access
router.delete('/:id', 
    verifyToken, 
    checkPermission('can_delete'), 
    postController.deletePost
);

module.exports = router;