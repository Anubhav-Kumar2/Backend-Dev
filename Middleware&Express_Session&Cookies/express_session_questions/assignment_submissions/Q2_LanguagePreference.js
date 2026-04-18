const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser('my_cookie_secret')); 

const languageMiddleware = (req, res, next) => {
    const userLang = req.signedCookies.lang || req.cookies.lang || 'en';
    req.preferredLanguage = userLang;
    next();
};

app.use(languageMiddleware);

app.post('/set-language', (req, res) => {
    const { lang } = req.body;
    
    if (!lang) return res.status(400).json({ error: 'Language code required' });

    res.cookie('lang', lang, { 
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        signed: true
    });

    res.json({ message: `Language successfully changed to ${lang}` });
});

app.get('/greeting', (req, res) => {
    const lang = req.preferredLanguage;
    let greeting = 'Hello'; 

    if (lang === 'hi') greeting = 'नमस्ते';
    if (lang === 'fr') greeting = 'Bonjour';
    if (lang === 'es') greeting = 'Hola';

    res.json({ 
        currentLanguage: lang,
        message: `${greeting}, Welcome to our website!` 
    });
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Q2 Server running on port ${PORT}`));
