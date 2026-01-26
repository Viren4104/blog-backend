const express = require("express");
const router = express.Router();
 
const {
  getAllUsers,
  updateUserPermissions,
} = require("../controllers/adminController");
 
const { protect, adminOnly } = require("../middleware/authMiddleware");
 

// ADMIN ROUTES (/api/admin)

 
// GET ALL USERS
router.get("/users", protect, adminOnly, getAllUsers);
 
// UPDATE USER ROLE & PERMISSION
router.patch(
  "/users/:userId/permissions",
  protect,
  adminOnly,
  updateUserPermissions
);
 
module.exports = router;