import { execFile } from 'node:child_process';

execFile("./someFile.sh", (error, stdout, stderr) => {
    if(error) {
        console.log(`error ${error}`);
        return;
    } 
    if(stderr) {
        console.log(`stderr ${stderr}`);
        return;
    }
    if(stdout) {
        console.log(`stdout ${stdout}`);
    }
})

// same problem
// execFile is not for comm. that give huge output => example => find /
// for that we use spawn()