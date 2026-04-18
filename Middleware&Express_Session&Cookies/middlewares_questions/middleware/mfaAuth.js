const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ==========================================
// Middleware 2: Multi-Factor Authentication (MFA)
// ==========================================
const protect = async (req, res, next) => {
    let token;

    // 1. Verify JWT token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }

            // 2. Verify OTP for MFA
            // Check OTP in headers (x-otp) or request body
            const otp = req.headers['x-otp'] || req.body.otp;
            
            if (!otp) {
                return res.status(401).json({ success: false, error: 'MFA required. Please provide OTP in x-otp header or body' });
            }

            // Mock OTP verification (In a real scenario, compare with Redis/DB stored OTP)
            if (otp !== '123456') {
                return res.status(401).json({ success: false, error: 'Invalid OTP' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
