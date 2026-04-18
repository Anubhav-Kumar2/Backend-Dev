const User = require('../models/User');

// @desc    Get Cart
// @route   GET /api/cart
// @access  Public (Anon via Cookie, Auth via DB)
const getCart = async (req, res) => {
  try {
    if (req.session && req.session.user) {
      // Authenticated User: Get from DB
      const user = await User.findById(req.session.user.id);
      return res.json({ cart: user.cart, type: 'authenticated' });
    } else {
      // Anonymous User: Get from Cookies
      const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
      return res.json({ cart, type: 'anonymous' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to Cart
// @route   POST /api/cart
// @access  Public
const addToCart = async (req, res) => {
  try {
    const { productId, name, price, quantity } = req.body;
    const newItem = { productId, name, price, quantity: quantity || 1 };

    if (req.session && req.session.user) {
      // Authenticated User: Update DB
      const user = await User.findById(req.session.user.id);
      
      const existingItem = user.cart.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        user.cart.push(newItem);
      }
      
      await user.save();
      return res.json({ message: 'Added to cart', cart: user.cart });
    } else {
      // Anonymous User: Update Cookie
      let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
      
      const existingItem = cart.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        cart.push(newItem);
      }

      // Set cookie for 7 days
      res.cookie('cart', JSON.stringify(cart), { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json({ message: 'Added to anonymous cart', cart });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from Cart
// @route   DELETE /api/cart/:productId
// @access  Public
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (req.session && req.session.user) {
      const user = await User.findById(req.session.user.id);
      user.cart = user.cart.filter(item => item.productId !== productId);
      await user.save();
      return res.json({ message: 'Removed from cart', cart: user.cart });
    } else {
      let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
      cart = cart.filter(item => item.productId !== productId);
      res.cookie('cart', JSON.stringify(cart), { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json({ message: 'Removed from anonymous cart', cart });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  removeFromCart
};
