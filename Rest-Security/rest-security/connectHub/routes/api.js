const express = require('express');
const router = express.Router();
const { validateProfileUpdate, validateMessage } = require('../middleware/validators');
const requireAuth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// --- Auth Mock (For demonstration/testing purposes) ---
router.post('/login', async (req, res) => {
    // In a real app, verify password here
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        // Create dummy user if doesn't exist
        if (!user) {
            user = await User.create({
                email,
                username: email.split('@')[0],
                password: 'hashedpassword'
            });
        }
        req.session.userId = user._id.toString();
        res.json({ message: 'Logged in successfully', user });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid'); // Match your session cookie name if changed
    res.json({ message: 'Logged out successfully' });
});

// --- Profile Routes ---
// Protected route + Validation Middleware
router.put('/profile', requireAuth, validateProfileUpdate, async (req, res) => {
    try {
        // req.body is already sanitized (HTML XSS) by xssSanitizer
        // and validated (rules) by validateProfileUpdate
        
        const updatedUser = await User.findByIdAndUpdate(
            req.session.userId,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    bio: req.body.bio,
                    profilePicUrl: req.body.profilePicUrl
                }
            },
            { new: true, runValidators: true } // Return updated doc, run mongoose validation
        );
        
        res.json({ message: 'Profile safely updated', user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
});

// --- Messaging Routes ---
// Send a message
router.post('/messages', requireAuth, validateMessage, async (req, res) => {
    try {
        const newMessage = await Message.create({
            senderId: req.session.userId,
            receiverId: req.body.receiverId,
            message: req.body.message // Sanitized by DOMPurify in global middleware
        });
        res.status(201).json({ message: 'Message sent', data: newMessage });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Read a private message (Authorization check)
router.get('/messages/:messageId', requireAuth, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // SECURITY CHECK: Authorization - Is this user involved in this message?
        const isParticipant = 
            message.senderId.toString() === req.session.userId || 
            message.receiverId.toString() === req.session.userId;

        if (!isParticipant) {
            return res.status(403).json({ error: 'Unauthorized to view this message' });
        }

        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
