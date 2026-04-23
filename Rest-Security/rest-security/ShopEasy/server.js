const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const DOMPurify = require('isomorphic-dompurify');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// 1. Configure Helmet for security headers (CSP)
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", "https://cdn.shopeasy.com"], // Allow images from CDN
    frameSrc: ["'self'", "https://www.youtube.com", "https://checkout.stripe.com"] // Allow youtube and stripe
  }
}));

// 2. Prevent MongoDB Injection
// This removes $ and . from user inputs so hackers can't run database commands
app.use(mongoSanitize());

// 3. Secure Authentication System
// Store session in database instead of memory so it doesn't get lost on restart
app.use(session({
  secret: 'my_secret_key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/shopeasy'
  }),
  cookie: {
    httpOnly: true, // Prevents hackers from stealing cookie using JavaScript (XSS)
    maxAge: 1000 * 60 * 60 * 24 * 7 // Session lasts for 7 days
  }
}));

// 4. Rate Limiting to prevent brute force attacks
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, // Only 5 login attempts every 15 minutes
  message: 'Too many login attempts. Try again later.'
});

// Apply rate limiting only to the login route
app.use('/api/login', loginLimiter);

// 5. Database Models
const Product = mongoose.model('Product', new mongoose.Schema({
  name: String,
  price: { 
    type: Number, 
    required: true, 
    min: [0.01, 'Price cannot be negative'] // Fixes negative product prices
  }
}));

const Review = mongoose.model('Review', new mongoose.Schema({
  productId: String,
  text: String
}));

// Middleware to check if user is admin
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ error: 'You are not an admin' });
}

// 6. Routes
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    req.session.user = { username: 'admin', role: 'admin' };
    res.json({ message: 'Admin logged in' });
  } else if (username === 'user' && password === 'user123') {
    req.session.user = { username: 'user', role: 'user' };
    res.json({ message: 'User logged in' });
  } else {
    res.status(401).json({ error: 'Wrong username or password' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// Protected admin route
app.get('/api/admin/dashboard', isAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

// Product search route
app.get('/api/products/search', async (req, res) => {
  // Convert search query to string to prevent injection
  const search = String(req.query.q || ''); 
  res.json({ message: `Searching for ${search}` });
});

// Review route
app.post('/api/reviews', async (req, res) => {
  const { text } = req.body;
  
  // Clean the text to prevent XSS attacks (e.g. removing <script> tags)
  const safeText = DOMPurify.sanitize(text);
  
  res.status(201).json({ 
    message: 'Review saved',
    safeText: safeText 
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
