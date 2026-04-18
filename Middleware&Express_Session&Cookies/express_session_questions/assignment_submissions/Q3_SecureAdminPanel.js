const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.use(session({
    secret: 'admin_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true }
}));

mongoose.connect('mongodb://127.0.0.1:27017/express_sessions_db')
    .then(() => console.log('MongoDB Connected for Q3'))
    .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    username: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});
const User = mongoose.model('UserQ3', userSchema);

const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Please log in first' });
    }
};

const isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.session.userId);
        if (user && user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

app.post('/setup-dummy-users', async (req, res) => {
    await User.deleteMany();
    await User.create({ username: 'admin1', role: 'admin' });
    await User.create({ username: 'user1', role: 'user' });
    res.json({ message: 'Dummy users created' });
});

app.post('/login', async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    req.session.userId = user._id;
    res.json({ message: `Logged in as ${username}`, role: user.role });
});

app.get('/public-data', (req, res) => {
    res.json({ data: 'Everyone can see this' });
});

app.get('/admin/dashboard', isAuthenticated, isAdmin, (req, res) => {
    res.json({ 
        message: 'Welcome to the Secure Admin Panel!',
        sensitiveData: 'System configuration and user metrics'
    });
});

const PORT = 5003;
app.listen(PORT, () => console.log(`Q3 Server running on port ${PORT}`));
