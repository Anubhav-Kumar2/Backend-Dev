const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { bookId, title, author, price } = req.body;
        if (!bookId || !title || !author || price === undefined) {
             return res.status(400).json({ error: 'Missing book details' });
        }
        const book = new Book({ bookId, title, author, price });
        await book.save();
        res.status(201).json(book);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
