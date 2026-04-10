const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    // Keeping id for backward compatibility with the CLI script,
    // though in a real REST API _id is preferred.
    id: { 
        type: Number 
    },
    title: { 
        type: String, 
        required: [true, 'Please add a text value'] 
    },
    description: { 
        type: String 
    },
    status: { 
        type: String, 
        default: "Pending" 
    }
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
