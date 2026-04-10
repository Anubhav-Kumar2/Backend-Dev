// Array to store our todos and state management functions
let todos = [];

module.exports = {
    getTodos: () => todos,
    setTodos: (newTodos) => { todos = newTodos; },
    addTodoToState: (todo) => { todos.push(todo); }
};
