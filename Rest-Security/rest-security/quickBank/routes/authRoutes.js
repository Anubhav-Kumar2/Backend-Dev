const express = require('express');
const { login, forgotPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/forgotpassword', forgotPassword);

module.exports = router;
