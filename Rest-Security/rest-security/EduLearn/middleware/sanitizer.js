const sanitizeHtml = require('sanitize-html');

const sanitizeInput = (req, res, next) => {
  if (req.body && req.body.description) {
    req.body.description = sanitizeHtml(req.body.description, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      allowedAttributes: { 'a': ['href'] }
    });
  }
  
  if (req.body && req.body.message) {
    req.body.message = sanitizeHtml(req.body.message, {
      allowedTags: [], // Strip all tags for simple messages
      allowedAttributes: {}
    });
  }

  next();
};

module.exports = { sanitizeInput };
