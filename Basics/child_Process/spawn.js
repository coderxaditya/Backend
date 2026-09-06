import { spawn } from 'node:child_process';

// there is an argumnet to the command ls(that is -lh)
// we provide those agrs. inside an array
// same for all comm. having any arrgs.



// const child = spawn("ls", ["-lh"])

// const child = spawn("pwd")

const child = spawn("find", ["/"])
// you can see that all the standard output that we would have gotten inside our terminal(inside console)
// and that is because the spawn method do not use the buffer it uses streams so that all the standard output that is comming inside out terminal is streamed inside our console here.

child.stdout.on("data", (data) => {
    console.log(`stdout ${data}`);
})

child.stderr.on("data", (data) => {
    console.log(`stderr ${data}`);
})

child.on("error", (error) => {
    console.log(`stderr ${error.message}`);
})

child.on("exit", ( code, signal) => {
    if(code !== null) {
        console.log(`Process exit with code: ${code}`);
    }
    if(signal !== null) {
        console.log(`Process killed with signal: ${signal}`);
    }

    console.log("Done");
})