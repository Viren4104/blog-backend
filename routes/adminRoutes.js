const express = require("express");
const router = express.Router();

// 🛡️ Import controllers and middleware
// Ensure these names match the 'exports.name' in your files!
const { 
  getAllUsers, 
  updateUserPermissions 
} = require("../controllers/adminController");

const { 
  protect, 
  adminOnly 
} = require("../middleware/authMiddleware");

/* ===============================
   ADMIN ROUTES
================================ */

// 1. GET ALL USERS
// Logic: protect (is logged in?) -> adminOnly (is Viren/Admin?) -> controller
router.get("/users", protect, adminOnly, getAllUsers);

// 2. UPDATE USER ROLE & PERMISSIONS
// This triggers the Socket.io 'permissions-updated' event in the controller
router.patch(
  "/users/:userId/permissions",
  protect,
  adminOnly,
  updateUserPermissions
);

module.exports = router;