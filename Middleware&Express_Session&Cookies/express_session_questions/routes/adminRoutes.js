const express = require('express');
const router = express.Router();
const { getAdminDashboard, getAllUsers } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect); // Require authentication for all admin routes
router.use(admin);   // Require admin role for all admin routes

router.get('/dashboard', getAdminDashboard);
router.get('/users', getAllUsers);

module.exports = router;
