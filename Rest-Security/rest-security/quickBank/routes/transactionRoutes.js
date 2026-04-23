const express = require('express');
const { transferMoney } = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/transfer', transferMoney);

module.exports = router;
