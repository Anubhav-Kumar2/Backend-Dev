// Role-Based Access Control Middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is logged in
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Please log in to access this resource.' });
    }

    // Check if user has required role
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
    }

    next();
  };
};

module.exports = { authorize };
