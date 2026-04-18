const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route. Missing Token.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);

        const otpCode = req.headers['x-otp-code'];

        if (!otpCode) {
            return res.status(401).json({ success: false, error: 'MFA Required. Please provide OTP code in x-otp-code header.' });
        }

        if (otpCode !== '123456') {
            return res.status(401).json({ success: false, error: 'Invalid OTP code.' });
        }

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized. Token failed.' });
    }
};
