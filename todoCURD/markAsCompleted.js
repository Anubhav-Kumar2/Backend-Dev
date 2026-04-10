const Todo = require('./todoModel');

/**
 * 4. MARK AS COMPLETED
 * Changes status from "Pending" to "Completed"
 */
async function markAsCompleted(id) {
  try {
    const todo = await Todo.findOne({ id: id });
    
    if (!todo) {
      console.log(`Error: Cannot complete. Todo with ID ${id} not found.`);
      return;
    }

    if (todo.status === "Completed") {
      console.log(`Info: Todo ID ${id} is already completed.`);
      return;
    }

    todo.status = "Completed";
    await todo.save();
    console.log(`Success: Marked Todo ID ${id} as Completed`);
  } catch (error) {
    console.log(`Error: Could not mark as completed. ${error.message}`);
  }
}

module.exports = markAsCompleted;
