// @desc    Set Language Preference
// @route   POST /api/settings/language
// @access  Public
const setLanguage = (req, res) => {
  const { lang } = req.body;
  if (!lang) {
    return res.status(400).json({ message: 'Language code is required' });
  }

  // Set cookie with 30 days expiration
  res.cookie('lang', lang, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
  res.json({ message: `Language updated to ${lang}` });
};

// @desc    Get Current Language Preference
// @route   GET /api/settings/language
// @access  Public
const getLanguage = (req, res) => {
  res.json({ language: req.lang });
};

// @desc    Get Session Status (Timeout Warning System)
// @route   GET /api/settings/session-status
// @access  Private
const getSessionStatus = (req, res) => {
  if (req.session && req.session.user) {
    // Cookie maxAge is updated automatically by express-session if rolling:true
    // Or we can check req.session.cookie.expires
    const expires = new Date(req.session.cookie.expires).getTime();
    const now = Date.now();
    const remainingTimeMs = expires - now;

    res.json({
      active: true,
      remainingTimeMs: remainingTimeMs > 0 ? remainingTimeMs : 0,
      warningThresholdMs: 2 * 60 * 1000 // Tell frontend to warn at 2 minutes
    });
  } else {
    res.json({ active: false });
  }
};

module.exports = {
  setLanguage,
  getLanguage,
  getSessionStatus
};
