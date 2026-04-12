const { books, getNextId } = require('../models/bookModel');

// READ: Get all books (with optional filtering and pagination via query params)
const getAllBooks = (req, res) => {
  let results = [...books];
  const { author, year, page, limit } = req.query;

  // Filtering
  if (author) {
    results = results.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
  }
  if (year) {
    results = results.filter(b => b.year === parseInt(year));
  }

  // Pagination
  if (page && limit) {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    results = results.slice(startIndex, endIndex);
  }

  res.status(200).json(results);
};

// READ: Search books by title
const searchBooks = (req, res) => {
  const { title } = req.query;
  
  if (!title) {
    return res.status(400).json({ error: 'Search keyword "title" is required.' });
  }

  const results = books.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
  res.status(200).json(results);
};

// READ: Get a single book by ID
const getBookById = (req, res) => {
  const bookId = parseInt(req.params.id);
  const book = books.find(b => b.id === bookId);

  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  res.status(200).json(book);
};

// CREATE: Add a new book
const createBook = (req, res) => {
  const { title, author, year } = req.body;
  
  const newBook = {
    id: getNextId(),
    title,
    author,
    year
  };
  
  books.push(newBook);
  
  res.status(201).json(newBook);
};

// UPDATE: Replace full book details
const updateBook = (req, res) => {
  const bookId = parseInt(req.params.id);
  const { title, author, year } = req.body;

  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Replace full properties but maintain ID
  books[bookIndex] = {
    id: bookId,
    title,
    author,
    year
  };

  res.status(200).json(books[bookIndex]);
};

// UPDATE: Modify specific provided fields
const patchBook = (req, res) => {
  const bookId = parseInt(req.params.id);
  
  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  // Merge existing items with new items provided in req.body.
  // Ensure we do not overwrite the ID by asserting id is still bookId
  const updatedBook = { ...books[bookIndex], ...req.body, id: bookId };
  books[bookIndex] = updatedBook;

  res.status(200).json(books[bookIndex]);
};

// DELETE: Remove book
const deleteBook = (req, res) => {
  const bookId = parseInt(req.params.id);
  const bookIndex = books.findIndex(b => b.id === bookId);

  if (bookIndex === -1) {
    return res.status(404).json({ error: 'Book not found' });
  }

  books.splice(bookIndex, 1);
  
  res.status(200).json({ message: `Book with id ${bookId} successfully deleted.` });
};

module.exports = {
  getAllBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  patchBook,
  deleteBook
};
