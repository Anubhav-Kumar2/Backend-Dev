const express = require('express');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const useragent = require('express-useragent');
const morgan = require('morgan');
const logger = require('./config/logger');

const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(useragent.express());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  }
}));

app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again after an hour'
});
app.use('/api/v1/auth/login', loginLimiter);

app.use(hpp());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/transactions', transactionRoutes);

app.use((err, req, res, next) => {
  logger.error(err.stack);
  
  let errorMsg = 'Server Error';
  if (err.name === 'ValidationError') errorMsg = err.message;
  if (err.name === 'CastError') errorMsg = 'Resource not found';

  res.status(err.statusCode || 500).json({
    success: false,
    error: errorMsg
  });
});

module.exports = app;
