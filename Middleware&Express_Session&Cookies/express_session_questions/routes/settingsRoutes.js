const express = require('express');
const router = express.Router();
const { setLanguage, getLanguage, getSessionStatus } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.route('/language')
  .get(getLanguage)
  .post(setLanguage);

router.get('/session-status', protect, getSessionStatus);

module.exports = router;
