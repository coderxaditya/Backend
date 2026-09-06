import { exec } from 'node:child_process';

// "ls -lh" => gives list of the files in human readable byte format
// psw => The command to find your current working directory
// error => problem while runing the comm. (comm. may not exist or wrong comm. ,or missing args)
// stdout => output comming from the console
// stderr => error after comm. ran succesfully 
exec("ls -lh", (error, stdout, stderr) => {
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

// exec is not for comm. that give huge output => example => find /
// for that we use spawn()