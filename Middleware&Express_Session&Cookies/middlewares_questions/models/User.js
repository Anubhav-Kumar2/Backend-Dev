const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false // Exclude from query results by default
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date,
        default: null
    },
    lastLogout: {
        type: Date,
        default: null
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// ==========================================
// Middleware 3: User Activity Tracker
// ==========================================
// Automatically update lastActive on save
userSchema.pre('save', function (next) {
    // Only update if it's not a newly created document or if we explicitly want to
    if (!this.isNew) {
        this.lastActive = new Date();
    }
    next();
});

// Update lastActive on queries like findOneAndUpdate
userSchema.pre('findOneAndUpdate', function (next) {
    this.set({ lastActive: new Date() });
    next();
});

userSchema.pre('updateOne', function (next) {
    this.set({ lastActive: new Date() });
    next();
});


// ==========================================
// Middleware 4: Soft Delete System 
// ==========================================
// Filter out deleted documents automatically from find queries
userSchema.pre(/^find/, function (next) {
    // 'this' refers to the current query. Add filter to exclude isDeleted: true
    this.find({ isDeleted: { $ne: true } });
    next();
});


// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to match entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
