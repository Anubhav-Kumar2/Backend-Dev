const express = require('express');
const router = express.Router();
const { getProfile, deleteProfile, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/mfaAuth');

// Protected routes using MFA (requires JWT + OTP)
router.get('/profile', protect, getProfile);
router.delete('/profile', protect, deleteProfile);

// Public route to see all users (demonstrates soft-delete exclusion)
router.get('/', getUsers);

module.exports = router;
