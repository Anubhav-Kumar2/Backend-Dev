const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

userSchema.pre('save', function (next) {
    if (!this.isNew) {
        this.lastActive = new Date();
    }
    next();
});

userSchema.pre('findOneAndUpdate', function (next) {
    this.set({ lastActive: new Date() });
    next();
});

userSchema.pre('updateOne', function (next) {
    this.set({ lastActive: new Date() });
    next();
});

module.exports = mongoose.model('User', userSchema);
