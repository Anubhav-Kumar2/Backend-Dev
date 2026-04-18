const User = require('../models/User');

// @desc    Get logged in user profile
// @route   GET /api/users/profile
// @access  Private (Requires JWT + OTP)
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Soft delete user profile
// @route   DELETE /api/users/profile
// @access  Private
exports.deleteProfile = async (req, res, next) => {
    try {
        // ==========================================
        // Middleware 4 Requirement: Soft Delete execution
        // ==========================================
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user.isDeleted = true;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, message: 'User deleted successfully (soft delete)' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all active users
// @route   GET /api/users
// @access  Public (for demo purposes)
exports.getUsers = async (req, res, next) => {
    try {
        // Will automatically exclude deleted documents due to mongoose pre('find') middleware
        const users = await User.find();
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        next(error);
    }
};
