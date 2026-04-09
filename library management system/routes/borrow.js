const express = require('express');
const Member = require('../models/Member');
const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
    try {
        const { memberId, bookIdsArray } = req.body; // e.g. "M001", [101, 102]
        
        const member = await Member.findOne({ memberId });
        if (!member) return res.status(404).json({ error: 'Member not found' });

        const books = await Book.find({ bookId: { $in: bookIdsArray } });
        if (books.length === 0) return res.status(400).json({ error: 'No valid books found' });

        const bookObjIds = books.map(b => b._id);
        const record = new BorrowRecord({ member: member._id, books: bookObjIds });
        await record.save();

        res.status(201).json({ message: 'Books borrowed successfully', record });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/:memberId/summary', auth, async (req, res) => {
    try {
        const member = await Member.findOne({ memberId: req.params.memberId });
        if (!member) return res.status(404).json({ error: 'Member not found' });

        const records = await BorrowRecord.find({ member: member._id }).populate('books');
        
        let totalValue = 0;
        let borrowedBooks = [];

        records.forEach(record => {
            record.books.forEach(book => {
                borrowedBooks.push({ title: book.title, author: book.author, price: book.price });
                totalValue += book.price;
            });
        });

        const sampleFine = 10;
        let discountPct = member.membershipType === 'Gold' ? 15 : 5;
        const discountAmount = (sampleFine * discountPct) / 100;
        const finalFine = sampleFine - discountAmount;

        res.json({
            member: { name: member.name, membershipType: member.membershipType },
            borrowedBooks,
            totalValue,
            exampleFineCalc: { base: sampleFine, discountPct, finalFine }
        });
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
});

module.exports = router;
