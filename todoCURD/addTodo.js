const Todo = require('./todoModel');

/**
 * 1. ADD TODO
 * Adds a new todo object to the array with default status "Pending"
 */
async function addTodo(id, title, description) {
  if (id === undefined || id === null) {
    console.log(`Error: Invalid ID provided for "${title}".`);
    return;
  }
  
  try {
    const exists = await Todo.findOne({ id: id });
    if (exists) {
      console.log(`Error: Todo with ID ${id} already exists.`);
      return;
    }

    const newTodo = new Todo({
      id: id,
      title: title,
      description: description,
      status: "Pending" // Default status
    });

    await newTodo.save();
    console.log(`Success: Added Todo -> [${id}] ${title}`);
  } catch (error) {
    console.log(`Error: Could not add Todo. ${error.message}`);
  }
}

module.exports = addTodo;
