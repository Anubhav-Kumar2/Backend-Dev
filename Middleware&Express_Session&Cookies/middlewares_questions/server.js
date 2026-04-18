const express = require('express');
const dotenv = require('dotenv');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const connectDB = require('./config/db');
const reqLogger = require('./middleware/logger');
const errorHandler = require('./middleware/error');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Body parser
app.use(express.json());

// ==========================================
// Middleware 5: Data Sanitization
// ==========================================
// Prevent NoSQL injections
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// ==========================================
// Middleware 1: Request Logging
// ==========================================
// Log every HTTP request
app.use(reqLogger);


// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Basic health check route
app.get('/', (req, res) => {
    res.json({ success: true, message: 'Welcome to the Middleware Backend API' });
});

// Mount Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
