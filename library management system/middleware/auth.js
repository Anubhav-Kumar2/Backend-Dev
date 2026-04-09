const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const bearer = token.split(' ')[1] || token;
    const decoded = jwt.verify(bearer, process.env.JWT_SECRET || 'supersecret');
    req.user = decoded; // add user to request
    next();
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};
