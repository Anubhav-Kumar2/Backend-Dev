const readline = require('readline');
const connectDB = require('./db');
const mongoose = require('mongoose');
const addTodo = require('./addTodo');
const getAllTodos = require('./getAllTodos');
const updateTodo = require('./updateTodo');
const markAsCompleted = require('./markAsCompleted');
const deleteTodo = require('./deleteTodo');

// Create a readline interface to take input from the terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log("\n====== TODO APP MENU ======");
    console.log("1. Add new Todo");
    console.log("2. Display all Todos");
    console.log("3. Update a Todo");
    console.log("4. Mark as Completed");
    console.log("5. Delete a Todo");
    console.log("6. Exit from App");
    
    rl.question("\n👉 Type a number and press Enter (1-6): ", (choice) => {
        handleUserInput(choice);
    });
}

function handleUserInput(choice) {
    switch(choice.trim()) {
        case '1':
            rl.question("Enter ID (number): ", (idStr) => {
                const id = parseInt(idStr.trim());
                rl.question("Enter Title: ", (title) => {
                    rl.question("Enter Description: ", async (desc) => {
                        await addTodo(id, title.trim(), desc.trim());
                        showMenu();
                    });
                });
            });
            break;
            
        case '2':
            (async () => {
                await getAllTodos();
                showMenu();
            })();
            break;
            
        case '3':
            rl.question("Enter ID of Todo to update: ", (idStr) => {
                const id = parseInt(idStr.trim());
                rl.question("Enter new Title (or leave blank to ignore): ", (title) => {
                    rl.question("Enter new Description (or leave blank to ignore): ", async (desc) => {
                        await updateTodo(id, title.trim() || undefined, desc.trim() || undefined);
                        showMenu();
                    });
                });
            });
            break;
            
        case '4':
            rl.question("Enter ID of Todo to mark complete: ", async (idStr) => {
                const id = parseInt(idStr.trim());
                await markAsCompleted(id);
                showMenu();
            });
            break;
            
        case '5':
            rl.question("Enter ID of Todo to delete: ", async (idStr) => {
                const id = parseInt(idStr.trim());
                await deleteTodo(id);
                showMenu();
            });
            break;
            
        case '6':
            console.log("👋 Closing database connection and exiting... Goodbye!");
            (async () => {
                await mongoose.connection.close();
                rl.close();
            })();
            break;
            
        default:
            console.log("❌ Invalid option. Please choose between 1 and 6.");
            showMenu();
            break;
    }
}

// Boot up the Interactive Mode
const init = async () => {
    await connectDB();
    console.log("🚀 Starting Interactive Todo Mode with MongoDB...");
    showMenu();
};

init();
