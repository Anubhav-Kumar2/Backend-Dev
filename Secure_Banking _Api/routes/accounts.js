const express = require('express');
const { protect } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { amountValidation, transferValidation } = require('../utils/validators');
const checkBalance = require('../utils/checkBalance');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = express.Router({ mergeParams: true });

// Get user's account
const getUserAccount = asyncHandler(async (req, res, next) => {
  const account = await Account.findOne({ user: req.user._id }).populate('user', 'name email');
  if (!account) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }
  req.account = account;
  next();
});

// @desc Get balance
// @route GET /api/accounts/balance
router.get('/balance', protect, getUserAccount, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { balance: req.account.balance }
  });
}));

// @desc Get transaction history
// @route GET /api/accounts/history
router.get('/history', protect, getUserAccount, asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({
    $or: [{ fromAccount: req.account._id }, { toAccount: req.account._id }]
  })
  .sort({ createdAt: -1 })
  .populate('fromAccount', 'accountType balance')
  .populate('toAccount', 'accountType balance')
  .limit(50);

  res.json({
    success: true,
    count: transactions.length,
    data: transactions
  });
}));

// @desc Deposit
// @route POST /api/accounts/deposit
router.post('/deposit', protect, getUserAccount, validateRequest(amountValidation), asyncHandler(async (req, res) => {
  const { amount } = req.body;
  req.account.balance += amount;
  await req.account.save();

  // Create transaction (self deposit)
  await Transaction.create({
    fromAccount: req.account._id,
    toAccount: req.account._id,
    amount,
    description: 'Deposit'
  });

  res.json({
    success: true,
    message: 'Deposit successful',
    data: { balance: req.account.balance }
  });
}));

// @desc Withdraw
// @route POST /api/accounts/withdraw
router.post('/withdraw', protect, getUserAccount, validateRequest(amountValidation), asyncHandler(async (req, res) => {
  const { amount } = req.body;
  await checkBalance(req.account._id, amount);
  req.account.balance -= amount;
  await req.account.save();

  await Transaction.create({
    fromAccount: req.account._id,
    toAccount: req.account._id,
    amount,
    description: 'Withdrawal'
  });

  res.json({
    success: true,
    message: 'Withdrawal successful',
    data: { balance: req.account.balance }
  });
}));

// @desc Transfer
// @route POST /api/accounts/transfer
router.post('/transfer', protect, getUserAccount, validateRequest(transferValidation), asyncHandler(async (req, res) => {
  const { toAccountId, amount } = req.body;

  await checkBalance(req.account._id, amount);

  const toAccount = await Account.findById(toAccountId);
  if (!toAccount) {
    return res.status(404).json({ success: false, message: 'To account not found' });
  }

  // Transfer
  req.account.balance -= amount;
  toAccount.balance += amount;
  await Promise.all([req.account.save(), toAccount.save()]);

  await Transaction.create({
    fromAccount: req.account._id,
    toAccount: toAccount._id,
    amount,
    description: 'Transfer'
  });

  res.json({
    success: true,
    message: 'Transfer successful',
    data: { balance: req.account.balance }
  });
}));

module.exports = router;
