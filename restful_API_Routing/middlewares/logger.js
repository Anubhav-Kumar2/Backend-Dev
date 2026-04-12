// Logs the HTTP method, the URL, and the timestamp of every request
const logger = (req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} request to ${req.originalUrl}`);
  next();
};

module.exports = logger;
