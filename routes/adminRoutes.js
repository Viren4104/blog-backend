const express = require("express");
const router = express.Router();

// 🛡️ Import controllers and middleware
const { 
  getAllUsers, 
  updateUserPermissions 
} = require("../controllers/adminController");

const { 
  protect, 
  adminOnly 
} = require("../middleware/authMiddleware");

// 🔍 DEBUG CHECK: If any of these are false, your import is wrong
console.log("Admin Imports Check:", {
  protect: !!protect,
  adminOnly: !!adminOnly,
  getAllUsers: !!getAllUsers,
  updateUserPermissions: !!updateUserPermissions
});

/* ===============================
    ADMIN ROUTES
================================ */

// Line 22: Ensure all handlers are actual functions
if (protect && adminOnly && getAllUsers) {
    router.get("/users", protect, adminOnly, getAllUsers);
}

if (protect && adminOnly && updateUserPermissions) {
    router.patch(
      "/users/:userId/permissions",
      protect,
      adminOnly,
      updateUserPermissions
    );
}

module.exports = router;