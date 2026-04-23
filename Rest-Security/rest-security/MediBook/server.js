const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { securityMiddleware } = require('./middleware/security');
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const connectDB = require('./config/db');
const { auditLogger } = require('./config/logger');
dotenv.config();
const app = express();
connectDB();
app.use(express.json({ limit: '10kb' })); 
securityMiddleware(app);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    maxAge: 15 * 60 * 1000, 
    sameSite: 'strict'
  }
}));
app.use((req, res, next) => {
  if (req.path !== '/api/health') {
    auditLogger.info(`Incoming Request: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  }
  next();
});
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use((err, req, res, next) => {
  auditLogger.error(`Error: ${err.message}`);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`MediBook Server running on port ${PORT}`));
