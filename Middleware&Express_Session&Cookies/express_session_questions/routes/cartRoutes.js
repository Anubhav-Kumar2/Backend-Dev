const express = require('express');
const router = express.Router();
const { getCart, addToCart, removeFromCart } = require('../controllers/cartController');

router.route('/')
  .get(getCart)
  .post(addToCart);

router.route('/:productId')
  .delete(removeFromCart);

module.exports = router;
