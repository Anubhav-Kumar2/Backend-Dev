import fs from "fs";
import os from "os";

function computedetails() {
    try {
        let comdata = [];

        let obj = {
            DATE: new Date().toISOString(),
            Platform: os.platform(),
            CPU_Cores: os.cpus().length,
            Memory_in_bytes: os.totalmem(),
            Free_memory: os.freemem()
        };

        comdata.push(obj);

        fs.writeFileSync("log.txt", JSON.stringify(comdata, null, 2));
        console.log("System details logged");
    } catch (error) {
        console.log(error);
    }
}

setInterval(computedetails, 50000);

export default computedetails;