const crypto = require('crypto');
const User = require('../models/User');
const logger = require('../config/logger');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '15m'
  });

  const options = {
    expires: new Date(Date.now() + 15 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    message: 'Authentication successful'
  });
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.isLocked()) {
      logger.warn(`Locked account login attempt for: ${email}`);
      return res.status(403).json({ success: false, error: 'Account locked. Try again later.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 30 * 60 * 1000;
        logger.warn(`Account locked due to multiple failed attempts: ${email}`);
      }
      await user.save();
      
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    user.loginAttempts = 0;
    user.lockUntil = undefined;
    
    const currentDevice = {
      userAgent: req.useragent.source,
      ip: req.ip,
      lastLogin: Date.now()
    };
    
    const isRecognized = user.devices.some(d => d.ip === currentDevice.ip && d.userAgent === currentDevice.userAgent);
    
    if (!isRecognized) {
      logger.info(`New device detected for user ${user._id} from IP: ${req.ip}`);
      user.devices.push(currentDevice);
    } else {
      const device = user.devices.find(d => d.ip === currentDevice.ip && d.userAgent === currentDevice.userAgent);
      device.lastLogin = Date.now();
    }
    
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(200).json({ success: true, message: 'If the email exists, a reset link was sent' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `https://quickbank.com/resetpassword/${resetToken}`;

    const message = `You requested a password reset. Please go to this link: \n\n ${resetUrl} \n\nIf you did not request this, please contact support immediately.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message
      });

      res.status(200).json({ success: true, message: 'Email sent' });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
