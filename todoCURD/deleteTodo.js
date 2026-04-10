const Todo = require('./todoModel');

/**
 * 5. DELETE TODO
 * Removes the todo from the array using id
 */
async function deleteTodo(id) {
  try {
    const result = await Todo.deleteOne({ id: id });
    
    if (result.deletedCount === 0) {
      console.log(`Error: Cannot delete. Todo with ID ${id} not found.`);
    } else {
      console.log(`Success: Deleted Todo ID ${id}`);
    }
  } catch (error) {
    console.log(`Error: Could not delete Todo. ${error.message}`);
  }
}

module.exports = deleteTodo;
