const express = require('express');
const session = require('express-session');

const app = express();
app.use(express.json());

const SESSION_MAX_AGE = 15 * 60 * 1000;

app.use(session({
    secret: 'timeout_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: SESSION_MAX_AGE }
}));

app.post('/login', (req, res) => {
    req.session.user = { id: 1, name: 'John Doe' };
    res.json({ 
        message: 'Logged in successfully', 
        sessionExpiresAt: req.session.cookie.expires 
    });
});

app.get('/session-status', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.json({ isActive: false, message: 'No active session' });
    }

    const expiresAt = new Date(req.session.cookie.expires).getTime();
    const now = Date.now();
    const remainingTimeMs = expiresAt - now;

    const WARNING_THRESHOLD_MS = 2 * 60 * 1000; 

    if (remainingTimeMs <= 0) {
        return res.json({ isActive: false, message: 'Session expired' });
    }

    res.json({
        isActive: true,
        remainingTimeSeconds: Math.floor(remainingTimeMs / 1000),
        shouldWarnUser: remainingTimeMs <= WARNING_THRESHOLD_MS
    });
});

app.post('/refresh-session', (req, res) => {
    if (req.session && req.session.user) {
        req.session.touch(); 
        res.json({ message: 'Session refreshed' });
    } else {
        res.status(401).json({ error: 'No active session' });
    }
});

const PORT = 5004;
app.listen(PORT, () => console.log(`Q4 Server running on port ${PORT}`));
