const fs = require("fs");

fs.readFile("input.txt", "utf8", (err, data) => {
  if (err) {
    console.log("File not found");
    return;
  }
  const words = data.split(" ");
  const count = words.length;

  fs.writeFile("output.txt", "Word Count: " + count, () => {
    console.log("Anubhav");
  });
});