const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname,"log.txt");

function createLog(date, type, data){
    fs.writeFileSync(
        logFile,
        `Date: ${date}\nType: ${type}\nMessage: ${data}\n\n`
    );
    return "Log created successfully";
}

function readLog(){
    if(!fs.existsSync(logFile)){
        return "File does not exist";
    }
}

function updateLog(date, type, data){
    fs.appendFileSync(
        logFile,
        `Date: ${date}\nType: ${type}\nMessage: ${data}\n\n`
    );
    return "Log updated successfully";
}

// setInterval(()=>{
//     console.log(updateLog(new Date(),"error","this is error"));
// },5000)

// console.log(updateLog(new Date(),"error","this is error"));

setTimeout(()=>{
    console.log(updateLog(new Date(),"error","this is error"));
},10000)

console.log(updateLog(new Date(),"error","this is error"));

module.exports = {
    createLog,
    readLog,
    updateLog
};