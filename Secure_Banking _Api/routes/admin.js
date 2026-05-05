const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Account = require('../models/Account');
const User = require('../models/User');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = express.Router();

// @desc    Get all accounts (admin only)
// @route   GET /api/admin/accounts
router.get('/accounts', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const accounts = await Account.find({}).populate({
    path: 'user',
    select: 'name email role'
  }).sort('-createdAt');

  res.json({
    success: true,
    count: accounts.length,
    data: accounts
  });
}));

module.exports = router;
