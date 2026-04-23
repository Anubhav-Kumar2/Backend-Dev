const express = require('express');
const router = express.Router();

const { authorize } = require('../middleware/auth');
const { sanitizeInput } = require('../middleware/sanitizer');
const upload = require('../middleware/upload');
const { loginLimiter, quizLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');

// --- Authentication Routes ---

// Login with Rate Limiting
router.post('/auth/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session
    req.session.user = { id: user._id, role: user.role, username: user.username };
    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// --- Course Routes ---

// Create Course (Instructor/Admin only) with XSS Sanitization
router.post('/course/create', authorize('Instructor', 'Admin'), sanitizeInput, (req, res) => {
  const { title, description } = req.body;
  // Here description is already sanitized
  res.json({ message: 'Course created successfully', course: { title, description } });
});

// --- File Upload Routes ---

// Upload Assignment (Student only)
router.post('/upload-assignment', authorize('Student'), upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a valid file (PDF, JPEG, PNG, max 5MB)' });
  }
  
  // File is validated and temporarily in memory (req.file.buffer)
  res.json({ message: 'Assignment uploaded successfully', filename: req.file.originalname });
});

// --- Quiz Routes ---

// Submit Quiz (Student only) with Rate Limiting
router.post('/quiz/submit', authorize('Student'), quizLimiter, (req, res) => {
  const { answers } = req.body;
  res.json({ message: 'Quiz submitted successfully' });
});

module.exports = router;
