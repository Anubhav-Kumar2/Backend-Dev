require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

// Import routes and middleware
const apiRoutes = require('./routes/api');
const xssSanitizer = require('./middleware/sanitizer');

const app = express();

// 1. Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS Configuration (Mobile + Web apps)
const allowedOrigins = [
    'https://www.connecthub.com', // Web App
    'https://app.connecthub.com', // Mobile App
    'http://localhost:3000'       // Local Dev
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/connecthub', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// 3. Secure Session Management (Expiration & Cookies)
app.use(session({
    secret: process.env.SESSION_SECRET || 'super_secret_dev_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/connecthub',
        ttl: 14 * 24 * 60 * 60 // 14 days
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true if HTTPS
        httpOnly: true, // Prevent XSS reading the cookie
        sameSite: 'lax', // CSRF protection
        maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
    }
}));

// 4. Global XSS Protection Middleware
// This will intercept all incoming requests and sanitize HTML in body
app.use(xssSanitizer);

// 5. Routes
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
