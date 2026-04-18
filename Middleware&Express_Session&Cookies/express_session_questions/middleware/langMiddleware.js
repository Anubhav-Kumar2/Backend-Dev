const langMiddleware = (req, res, next) => {
  // Read language preference from signed cookies or cookies
  let lang = req.cookies.lang || 'en'; // default to english
  req.lang = lang;
  
  // Could attach language specific translations to req.t here if needed
  next();
};

module.exports = { langMiddleware };
