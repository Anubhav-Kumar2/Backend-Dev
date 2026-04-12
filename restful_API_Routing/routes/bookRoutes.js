const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const validateBook = require('../middlewares/validator');

// NOTE: Specific routes like /search should be declared before parameterized routes like /:id
// This prevents Express from treating "search" as an ID
router.get('/search', bookController.searchBooks);

// Routes for root /api/books
router.route('/')
  .get(bookController.getAllBooks)
  .post(validateBook, bookController.createBook);

// Routes for specific IDs /api/books/:id
router.route('/:id')
  .get(bookController.getBookById)
  .put(validateBook, bookController.updateBook)
  .patch(bookController.patchBook)
  .delete(bookController.deleteBook);

module.exports = router;
