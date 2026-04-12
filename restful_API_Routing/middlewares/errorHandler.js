// Global error handler middleware with 4 arguments (err, req, res, next)
const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler Log]:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'Something went unexpectedly wrong.'
  });
};

// Middleware for handling undefined routes
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} at path ${req.originalUrl}. Route does not exist.`
  });
};

module.exports = { errorHandler, notFoundHandler };
