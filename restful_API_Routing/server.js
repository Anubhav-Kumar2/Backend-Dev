const express = require('express');
const logger = require('./middlewares/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = 3000;

// Application-level middleware
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(logger); // Custom logging middleware

// API Routes
app.use('/api/books', bookRoutes);

// Catch-all for 404 responses
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
