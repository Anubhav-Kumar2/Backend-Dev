const User = require('../models/User');

// @desc    Register Step 1: Basic Info
// @route   POST /api/auth/register/step1
// @access  Public
const registerStep1 = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    res.status(400);
    throw new Error('Please provide name and email');
  }

  // Store in session
  req.session.registrationData = {
    ...req.session.registrationData,
    name,
    email
  };

  res.status(200).json({ message: 'Step 1 complete', data: req.session.registrationData });
};

// @desc    Register Step 2: Password
// @route   POST /api/auth/register/step2
// @access  Public
const registerStep2 = (req, res) => {
  const { password } = req.body;
  if (!password) {
    res.status(400);
    throw new Error('Please provide password');
  }

  if (!req.session.registrationData || !req.session.registrationData.email) {
    res.status(400);
    throw new Error('Please complete step 1 first');
  }

  req.session.registrationData.password = password;

  res.status(200).json({ message: 'Step 2 complete', data: { ...req.session.registrationData, password: '[HIDDEN]' } });
};

// @desc    Register Step 3: Profile Details & Finalize
// @route   POST /api/auth/register/step3
// @access  Public
const registerStep3 = async (req, res) => {
  try {
    const { age, bio } = req.body;
    
    if (!req.session.registrationData || !req.session.registrationData.password) {
      res.status(400);
      throw new Error('Please complete steps 1 and 2 first');
    }

    const { name, email, password } = req.session.registrationData;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      profileDetails: { age, bio }
    });

    if (user) {
      // Clear registration session data
      delete req.session.registrationData;

      res.status(201).json({
        message: 'Registration successful',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Login user & create session, merge cart
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Set user in session
      req.session.user = {
        id: user._id,
        role: user.role
      };

      // Cart Migration: Merge anonymous cart from cookies into user cart
      const anonCart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
      if (anonCart.length > 0) {
        // Merge strategy: Add items, update quantities if exist
        anonCart.forEach(anonItem => {
          const existingItem = user.cart.find(item => item.productId === anonItem.productId);
          if (existingItem) {
            existingItem.quantity += anonItem.quantity;
          } else {
            user.cart.push(anonItem);
          }
        });
        await user.save();
        
        // Clear anonymous cart cookie
        res.clearCookie('cart');
      }

      res.json({
        message: 'Logged in successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// @desc    Logout user & destroy session
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Could not log out' });
    }
    res.clearCookie('connect.sid'); // default session cookie name
    res.json({ message: 'Logged out successfully' });
  });
};

module.exports = {
  registerStep1,
  registerStep2,
  registerStep3,
  loginUser,
  logoutUser
};
