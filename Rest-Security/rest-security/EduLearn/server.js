require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const apiRoutes = require('./routes/api');

const app = express();

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/edulearn')
  .then(() => logger.info('MongoDB Connected'))
  .catch(err => logger.error('MongoDB connection error:', err));

// 1. HTTP Request Logger (Morgan)
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) }
}));

// 2. Helmet (CSP for Third Parties)
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://js.stripe.com"], // Allow Stripe scripts
    frameSrc: ["'self'", "https://js.stripe.com"],  // Allow Stripe iframes
    mediaSrc: ["'self'", "https://edulearn-videos.s3.amazonaws.com"], // Allow AWS S3 videos
    imgSrc: ["'self'", "data:", "https://edulearn-assets.s3.amazonaws.com"],
  }
}));

// 3. Body Parser & NoSQL Injection Prevention
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize()); // Global NoSQL Injection Prevention

// 4. Session Configuration with MongoStore
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey_edulearn_dev',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/edulearn'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

// 5. Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`EduLearn Server running on port ${PORT}`);
});
