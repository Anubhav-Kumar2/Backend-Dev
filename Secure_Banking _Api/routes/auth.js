const express = require('express');
const { registerValidation, loginValidation } = require('../utils/validators');
const validateRequest = require('../middleware/validateRequest');
const User = require('../models/User');
const Account = require('../models/Account');
const jwt = require('jsonwebtoken');
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
router.post('/register', validateRequest(registerValidation), asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    passwordHash: password // model hashes it
  });

  // Create account
  const account = await Account.create({ user: user._id });

  // Generate tokens
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  res.status(201).json({
    success: true,
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
router.post('/login', validateRequest(loginValidation), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check user and password
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Generate tokens
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });
  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE });

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  res.json({
    success: true,
    data: { user: { id: user._id, name: user.name, email: user.email, role: user.role }, accessToken, refreshToken }
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
router.post('/refresh', asyncHandler(async (req, res) => {
  const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRE });

    res.json({
      success: true,
      accessToken
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
}));

module.exports = router;
