const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json()); // Allow JSON body parsing

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/libraryDB')
    .then(() => console.log('Connected to MongoDB local database.'))
    .catch(err => console.error('MongoDB connection error:', err));

// Register Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/members', require('./routes/members'));
app.use('/api/borrow', require('./routes/borrow'));

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Library Management System API');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Library Server running on port ${PORT}`);
});
