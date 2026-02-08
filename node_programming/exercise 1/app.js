const fs = require("fs")
  let a = fs.writeFileSync("a.txt","HIII")

   function writeFile(Date, types, data){
    let res = fs.writeFileSync("log.txt", `this is  logger file ${Date} and ${types} and ${data}`)
    return res;

   }
let res = writeFile(new Date(), "Error", "this is erro ")
   console.log(res);
