
const express = require("express");
const router = express.Router();
 
const {
  getAllUsers,
  updateUserPermissions,
} = require("../controllers/adminController");
 
const { protect, adminOnly } = require("../middleware/authMiddleware");
 
router.get("/users", protect, adminOnly, getAllUsers);
 
router.patch(
  "/users/:userId/permissions",
  protect,
  adminOnly,
  updateUserPermissions
);
 