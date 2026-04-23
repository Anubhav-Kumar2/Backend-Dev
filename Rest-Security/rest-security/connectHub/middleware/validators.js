const { body, validationResult } = require('express-validator');

// Reusable validation result checker
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Validation for user profile updates
const validateProfileUpdate = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
        .isAlphanumeric().withMessage('Username can only contain letters and numbers')
        .escape(), // Escapes HTML entities as a fallback
    
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(), // Converts Test@Email.com to test@email.com
    
    body('profilePicUrl')
        .optional()
        .isURL({ require_protocol: true }).withMessage('Must be a valid URL')
        .matches(/^https:\/\//).withMessage('Profile picture must use HTTPS secure links'),

    checkValidation
];

// Validation for creating a post
const validatePostCreation = [
    body('postContent')
        .notEmpty().withMessage('Post content cannot be empty')
        .isLength({ max: 5000 }).withMessage('Post too long'),
    
    checkValidation
];

// Validation for sending a message
const validateMessage = [
    body('message')
        .notEmpty().withMessage('Message cannot be empty')
        .isLength({ max: 1000 }).withMessage('Message too long'),
    body('receiverId')
        .isMongoId().withMessage('Invalid receiver ID'),
    
    checkValidation
];

module.exports = {
    validateProfileUpdate,
    validatePostCreation,
    validateMessage
};
