const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String },
    isDeleted: {
        type: Boolean,
        default: false
    }
});

userSchema.pre(/^find/, function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

module.exports = mongoose.model('User', userSchema);
