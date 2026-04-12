// Validates the presence and types of required data in the request body
const validateBook = (req, res, next) => {
  // Only strictly validate on creation or full replacement
  if (req.method === 'POST' || req.method === 'PUT') {
    const { title, author, year } = req.body;

    // Check for missing data
    if (!title || !author || !year) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: title, author, and year are required.'
      });
    }

    // Check data types appropriately
    if (typeof title !== 'string' || typeof author !== 'string' || typeof year !== 'number') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid data types: title and author must be strings, year must be a number.'
      });
    }
  }

  next();
};

module.exports = validateBook;
