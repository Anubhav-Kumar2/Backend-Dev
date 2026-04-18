const User = require('../models/User');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    // Dummy stats for demonstration
    res.json({
      message: 'Welcome to the Admin Dashboard',
      stats: {
        totalUsers: userCount,
        activeSessions: 'Handled by session store in production'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get All Users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdminDashboard,
  getAllUsers
};
