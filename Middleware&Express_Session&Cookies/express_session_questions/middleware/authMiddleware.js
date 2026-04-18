const User = require('../models/User');

const protect = async (req, res, next) => {
  if (req.session && req.session.user) {
    try {
      req.user = await User.findById(req.session.user.id).select('-password');
      if (!req.user) {
        res.status(401);
        return next(new Error('Not authorized, user not found'));
      }
      next();
    } catch (error) {
      res.status(401);
      next(new Error('Not authorized, session failed'));
    }
  } else {
    res.status(401);
    next(new Error('Not authorized, no session'));
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized as an admin'));
  }
};

module.exports = { protect, admin };
