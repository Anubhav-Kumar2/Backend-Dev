const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/todos', require('./routes/todos'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Todo API with Full Authentication!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`- API Auth endpoints at: http://localhost:${PORT}/api/auth`);
    console.log(`- API Todo endpoints at: http://localhost:${PORT}/api/todos`);
});
