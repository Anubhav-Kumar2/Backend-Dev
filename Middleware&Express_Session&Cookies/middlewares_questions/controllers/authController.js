const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({
            email,
            password
        });

        res.status(201).json({
            success: true,
            token: generateToken(user._id),
            message: 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // ==========================================
        // Middleware 3 Requirement: Update lastLogin
        // ==========================================
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false }); // Skip validation to just update date

        res.json({
            success: true,
            token: generateToken(user._id),
            message: "Login successful. Use this token + OTP '123456' for protected routes."
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        // ==========================================
        // Middleware 3 Requirement: Update lastLogout
        // ==========================================
        req.user.lastLogout = new Date();
        await req.user.save();

        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};
