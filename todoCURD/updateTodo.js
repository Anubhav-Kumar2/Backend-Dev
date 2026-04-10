const Todo = require('./todoModel');

/**
 * 3. UPDATE TODO
 * Updates title and/or description based on id
 */
async function updateTodo(id, newTitle, newDescription) {
  try {
    const todo = await Todo.findOne({ id: id });
    
    if (!todo) {
      console.log(`Error: Cannot update. Todo with ID ${id} not found.`);
      return;
    }

    // Update properties if new values are provided
    if (newTitle) todo.title = newTitle;
    if (newDescription) todo.description = newDescription;

    await todo.save();
    console.log(`Success: Updated Todo ID ${id}`);
  } catch (error) {
     console.log(`Error: Could not update Todo. ${error.message}`);
  }
}

module.exports = updateTodo;
