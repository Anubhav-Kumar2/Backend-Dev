const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const securityMiddleware = (app) => {
  app.use(helmet());
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  });
  app.use('/api/', limiter);
  app.use(mongoSanitize());
};
module.exports = { securityMiddleware };
