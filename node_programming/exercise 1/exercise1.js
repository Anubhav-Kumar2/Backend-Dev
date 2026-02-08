// Create a Node.js program that reads a text file, counts the number of words, and writes the
// count to a new file.

const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'log.txt');

function readFileContent() {
    const data = fs.readFileSync(filepath, 'utf-8');

    const wordCount = data
        .split(" ")

    fs.writeFileSync('wordcount.txt', `Word Count: ${wordCount.length}`);
}


readFileContent();


module.exports = {
    readFileContent
}