const express = require('express');
const router = express.Router();
const {
  registerStep1,
  registerStep2,
  registerStep3,
  loginUser,
  logoutUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register/step1', registerStep1);
router.post('/register/step2', registerStep2);
router.post('/register/step3', registerStep3);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);

module.exports = router;
