const express = require('express');
const Member = require('../models/Member');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const members = await Member.find();
        res.json(members);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { memberId, name, membershipType } = req.body;
        if (!memberId || !name || !membershipType) {
            return res.status(400).json({ error: 'Missing member details' });
        }
        if (membershipType !== 'Normal' && membershipType !== 'Gold') {
            return res.status(400).json({ error: 'Invalid membershipType' });
        }
        const member = new Member({ memberId, name, membershipType });
        await member.save();
        res.status(201).json(member);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
