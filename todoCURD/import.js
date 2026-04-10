const fs = require('fs');
const { addTodoToState } = require('./data');
const getAllTodos = require('./getAllTodos');

console.log("Attempting to read 'my-data.json'...\n");

try {
    // 1. Read the JSON file synchronously from the filesystem
    const rawData = fs.readFileSync('./my-data.json', 'utf-8');

    // 2. Parse the literal text into usable Javascript arrays/objects
    const importedTodos = JSON.parse(rawData);

    console.log(`Found ${importedTodos.length} items in the file. Uploading...`);

    // 3. Loop through your uploaded data and save it
    importedTodos.forEach(todo => {
        addTodoToState({
            id: todo.id,
            title: todo.title,
            description: todo.description,
            status: "Pending" // Automatically initialize status
        });
    });

    console.log("Data successfully saved in system memory!\n");
    
    // 4. Show the todos to prove it works
    console.log("--- Executing: getAllTodos ---");
    getAllTodos();

} catch (error) {
    console.error("Failed to import data. Please make sure 'my-data.json' exists and is valid JSON.");
    console.error("Error Detail:", error.message);
}
