// Middleware to ensure user is logged in
const requireAuth = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }
    next();
};

module.exports = requireAuth;
