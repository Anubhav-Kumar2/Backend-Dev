// Simulated in-memory database
const books = [
  { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925 },
  { id: 2, title: '1984', author: 'George Orwell', year: 1949 },
  { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', year: 1960 }
];

// Helper method to get the next auto-incremented ID
const getNextId = () => {
  return books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
};

module.exports = {
  books,
  getNextId
};
