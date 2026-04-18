const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: 'cart_secret',
    resave: false,
    saveUninitialized: false
}));

mongoose.connect('mongodb://127.0.0.1:27017/express_sessions_db')
    .then(() => console.log('MongoDB Connected for Q5'))
    .catch(err => console.error(err));

const cartItemSchema = new mongoose.Schema({
    productId: String,
    name: String,
    quantity: { type: Number, default: 1 }
});

const userSchema = new mongoose.Schema({
    username: String,
    cart: [cartItemSchema]
});
const User = mongoose.model('UserQ5', userSchema);

app.post('/setup-user', async (req, res) => {
    await User.deleteMany();
    await User.create({ username: 'shopper', cart: [] });
    res.json({ message: 'Dummy user created' });
});

app.get('/cart', async (req, res) => {
    if (req.session && req.session.userId) {
        const user = await User.findById(req.session.userId);
        return res.json({ type: 'Authenticated', cart: user.cart });
    } else {
        const cookieCart = req.cookies.anonCart ? JSON.parse(req.cookies.anonCart) : [];
        return res.json({ type: 'Anonymous', cart: cookieCart });
    }
});

app.post('/cart/add', async (req, res) => {
    const { productId, name, quantity } = req.body;
    const newItem = { productId, name, quantity: quantity || 1 };

    if (req.session && req.session.userId) {
        const user = await User.findById(req.session.userId);
        user.cart.push(newItem);
        await user.save();
        res.json({ message: 'Added to Database Cart', cart: user.cart });
    } else {
        const cookieCart = req.cookies.anonCart ? JSON.parse(req.cookies.anonCart) : [];
        cookieCart.push(newItem);
        res.cookie('anonCart', JSON.stringify(cookieCart), { maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ message: 'Added to Cookie Cart', cart: cookieCart });
    }
});

app.post('/login', async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: 'User not found' });

    req.session.userId = user._id;

    const cookieCart = req.cookies.anonCart ? JSON.parse(req.cookies.anonCart) : [];
    
    if (cookieCart.length > 0) {
        user.cart.push(...cookieCart);
        await user.save();
        res.clearCookie('anonCart');
        return res.json({ message: 'Logged in and Cart Migrated', currentCart: user.cart });
    }

    res.json({ message: 'Logged in', currentCart: user.cart });
});

const PORT = 5005;
app.listen(PORT, () => console.log(`Q5 Server running on port ${PORT}`));
