const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // You can change 'mongodb://127.0.0.1:27017/todo-app' to your MongoDB Atlas URI.
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/todo-app');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
