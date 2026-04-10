const Todo = require('./todoModel');

/**
 * 2. DISPLAY TODOS
 * Displays all todos clearly showing id, title, description, and status
 */
async function getAllTodos() {
  try {
    const todos = await Todo.find();
    console.log("\n=================== ALL TODOS ===================");
    if (todos.length === 0) {
      console.log("No todos available.");
    } else {
      todos.forEach(todo => {
        console.log(`ID: ${todo.id}`);
        console.log(`Title: ${todo.title}`);
        console.log(`Description: ${todo.description}`);
        console.log(`Status: ${todo.status}`);
        console.log("-------------------------------------------------");
      });
    }
    console.log("=================================================\n");
  } catch (error) {
    console.log(`Error: Could not retrieve Todos. ${error.message}`);
  }
}

module.exports = getAllTodos;
