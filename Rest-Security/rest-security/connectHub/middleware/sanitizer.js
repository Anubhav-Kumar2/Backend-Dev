const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Reusable HTML sanitization allowing safe tags
const sanitizeHtml = (dirtyHtml) => {
    if (!dirtyHtml || typeof dirtyHtml !== 'string') return dirtyHtml;
    return DOMPurify.sanitize(dirtyHtml, {
        ALLOWED_TAGS: ['b', 'i', 'a'], // Allow safe HTML tags
        ALLOWED_ATTR: ['href', 'title', 'target'], // Allow links to work
    });
};

// Middleware to sanitize incoming request bodies globally
const xssSanitizer = (req, res, next) => {
    if (req.body) {
        // We recursively sanitize strings in the body
        const sanitizeObject = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    // Check if the string seems to contain HTML before sanitizing it, 
                    // or just sanitize fields that might have HTML like bio, postContent, message
                    if (['bio', 'postContent', 'message'].includes(key) || /<[a-z][\s\S]*>/i.test(obj[key])) {
                         obj[key] = sanitizeHtml(obj[key]);
                    }
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitizeObject(obj[key]);
                }
            }
        };
        sanitizeObject(req.body);
    }
    next();
};

module.exports = xssSanitizer;
