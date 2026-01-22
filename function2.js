let fs = require("fs")

function writeFile(){
    fs.access("ab.txt", (err)=>{
        if(err) throw err
        if(!err){
            fs.writeFile("ab.txt", " hii this is new eror ", (err)=>{
                if(err) throw err
                console.log(" data add sussessful");
            })
        }
    })
}


 export function readFile(){
     if(fs.existsSync("ab.txt")){
        fs.appendFileSync("ab.txt", ` \nHii this is  ne log ${new Date()}`)
     }
     else{
        fs.writeFileSync("ab.txt", " this is new data but not update ")
     }
}