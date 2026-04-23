const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User no longer exists' });
    }

    if (req.user.isLocked()) {
      return res.status(403).json({ success: false, error: 'Account is temporarily locked due to multiple failed login attempts' });
    }

    next();
  } catch (err) {
    logger.warn(`Unauthorized access attempt: ${err.message} from IP: ${req.ip}`);
    return res.status(401).json({ success: false, error: 'Not authorized' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      logger.warn(`User ${req.user.id} attempted to access restricted route with role ${req.user.role}`);
      return res.status(403).json({ success: false, error: 'User role is not authorized' });
    }
    next();
  };
};

exports.require2FA = async (req, res, next) => {
  if (req.user.twoFactorEnabled && !req.session2faVerified) {
    return res.status(401).json({ success: false, error: '2FA verification required for this action', challenge: true });
  }
  next();
};
