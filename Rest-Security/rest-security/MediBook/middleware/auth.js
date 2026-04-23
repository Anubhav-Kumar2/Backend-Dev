const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auditLogger } = require('../config/logger');
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.session && req.session.token) {
    token = req.session.token;
  }
  if (!token) {
    auditLogger.warn(`Unauthorized access attempt - IP: ${req.ip}`);
    return res.status(401).json({ error: 'Not authorized, no token' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    auditLogger.error(`Token verification failed - IP: ${req.ip}`);
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      auditLogger.warn(`RBAC violation by user ${req.user.id} - Role: ${req.user.role} attempted to access ${req.originalUrl}`);
      return res.status(403).json({ error: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};
module.exports = { protect, authorize };
