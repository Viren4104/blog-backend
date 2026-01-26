const express = require("express");
const router = express.Router();
 
const {
  getAllUsers,
  updateUserPermissions,
} = require("../controllers/adminController");
 
const { protect, adminOnly } = require("../middleware/authMiddleware");
 
// GET ALL USERS
router.get("/users", protect, adminOnly, getAllUsers);
 
// UPDATE USER ROLE & PERMISSION
router.patch(
  "/users/:userId/permissions",
  protect,
  adminOnly,
  updateUserPermissions
);

// ✅ CRITICAL: This was missing and caused the crash
module.exports = router;