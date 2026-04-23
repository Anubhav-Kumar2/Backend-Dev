const rateLimit = require('express-rate-limit');

// Login Rate Limiter: Max 5 attempts per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Quiz Submission Limiter: Prevent automated rapid-fire guessing
const quizLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // Max 3 submissions per minute
  message: { error: 'You are submitting too fast. Please review your answers.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, quizLimiter };
