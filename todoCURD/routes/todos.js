const express = require('express');
const router = express.Router();
const Todo = require('../todoModel');
const { protect } = require('../middleware/auth');

// All todo routes are protected
router.use(protect);

// @route   GET /api/todos
// @desc    Get all todos for current user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user.id });
        res.status(200).json(todos);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/todos
// @desc    Create a new todo
// @access  Private
router.post('/', async (req, res) => {
    try {
        const { title, description, id } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const todo = await Todo.create({
            title,
            description: description || '',
            id: id || Date.now(), // Generate a fake id if not provided, for backward comp
            user: req.user.id
        });

        res.status(201).json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @route   PUT /api/todos/:id
// @desc    Update a todo (using MongoDB _id or custom id)
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        let todo;
        // Check if the id is a valid ObjectId, otherwise treat it as the custom numeric id
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            todo = await Todo.findById(req.params.id);
        } else {
            todo = await Todo.findOne({ id: req.params.id, user: req.user.id });
        }

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Make sure the logged in user matches the todo user
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to update this todo' });
        }

        const updatedTodo = await Todo.findByIdAndUpdate(
            todo._id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedTodo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        let todo;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            todo = await Todo.findById(req.params.id);
        } else {
            todo = await Todo.findOne({ id: req.params.id, user: req.user.id });
        }

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        // Check for user
        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this todo' });
        }

        await todo.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Todo deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   PATCH /api/todos/:id/complete
// @desc    Mark a todo as complete
// @access  Private
router.patch('/:id/complete', async (req, res) => {
    try {
        let todo;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            todo = await Todo.findById(req.params.id);
        } else {
            todo = await Todo.findOne({ id: req.params.id, user: req.user.id });
        }

        if (!todo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        if (todo.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to update this todo' });
        }

        todo.status = 'Completed';
        await todo.save();

        res.status(200).json(todo);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
