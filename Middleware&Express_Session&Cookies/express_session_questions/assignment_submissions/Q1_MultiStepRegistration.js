const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 }
}));

mongoose.connect('mongodb://127.0.0.1:27017/express_sessions_db')
    .then(() => console.log('MongoDB Connected for Q1'))
    .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    age: Number,
    bio: String
});
const User = mongoose.model('UserQ1', userSchema);

app.post('/register/step1', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Name and email required' });

    req.session.regData = { name, email };
    res.json({ message: 'Step 1 complete', currentData: req.session.regData });
});

app.post('/register/step2', (req, res) => {
    const { password } = req.body;
    if (!req.session.regData) return res.status(400).json({ error: 'Please complete Step 1 first' });
    if (!password) return res.status(400).json({ error: 'Password required' });

    req.session.regData.password = password;
    res.json({ message: 'Step 2 complete', currentData: { ...req.session.regData, password: '***' } });
});

app.post('/register/step3', async (req, res) => {
    const { age, bio } = req.body;
    if (!req.session.regData || !req.session.regData.password) {
        return res.status(400).json({ error: 'Please complete Step 1 and 2' });
    }

    try {
        const finalUserData = {
            ...req.session.regData,
            age,
            bio
        };

        const newUser = await User.create(finalUserData);
        delete req.session.regData;

        res.status(201).json({ message: 'Registration fully complete!', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Q1 Server running on port ${PORT}`));
