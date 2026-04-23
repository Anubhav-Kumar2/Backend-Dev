const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { auditLogger } = require('../config/logger');
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m' 
  });
};
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role
    });
    if (user) {
      auditLogger.info(`New user registered: ${user.email} with role: ${user.role}`);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return res.status(403).json({ error: 'Account is deactivated' });
      }
      const token = generateToken(user._id);
      req.session.token = token;
      auditLogger.info(`User logged in: ${user.email}`);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      });
    } else {
      auditLogger.warn(`Failed login attempt for email: ${email}`);
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error during login' });
  }
};
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    } else {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    }
  });
};
