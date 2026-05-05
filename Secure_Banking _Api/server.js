const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const adminRoutes = require('./routes/admin');

dotenv.config();


connectDB();

const app = express();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100 
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, 
  message: { success: false, message: 'Too many auth attempts, try again later' }
});

app.use(limiter);
app.use(cors());
app.use(express.json());


app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/admin', adminRoutes);


app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports=app;
