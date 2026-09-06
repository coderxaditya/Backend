import express from 'express';

import { fork } from 'child_process';

const app = express()

app.get("/", (req, res) => {
    res.send("Server is working!");
})

app.get("/one", (req, res) => {
    const sum = expensiveCalculation();
    res.send({ sum : sum })
})

app.get("/two", async(req, res) => {
    const sum = await expensiveCalculationPromice();
    res.send({ sum : sum })
})


// whenever the request is coming on the third route here, 
// we are spinning up a new child process
// A completely separate operating-system process.
// therefore, it will utilize the full power of your CPU
app.get("/three", (req, res) => {

    const child = fork("./longTask.js");
    // Every HTTP request creates a brand-new Node.js process.
    // We're doing it deliberately because it's an excellent way to learn Child Processes.
    // In production, you'd normally avoid spawning a fresh Node process for every CPU-heavy request.

    // Send the job to the child process.
    child.send("start");


    // Child successfully sends us a result.
    child.on("message", (sum) => {

        res.json({
            sum
        });

    });


    // Something went wrong while creating/running
    // the child process.
    child.on("error", (error) => {

        console.error(
            "Child process error:",
            error
        );

        // It is a boolean property in Node.js and Express that instantly 
        // tells you true or false—did your server already send out the HTTP 
        // response headers to the client, or not?
        if (!res.headersSent) {

            res.status(500).json({
                error: "Child process failed"
            });

        }

    });


    // The child process has exited.
    child.on("exit", (code, signal) => {

        console.log(
            `Child ${child.pid} exited`,
            {
                code,
                signal
            }
        );

    });

});


app.listen(3000, () => console.log("Server is running on 3000"))

const expensiveCalculation = () => {
    console.log("ONE ROUTE HIT");
    let sum = 0
    for(let i = 0; i < 1e8; i++) {
        sum += i
    }
    return sum; 
}


const expensiveCalculationPromice = () => {
    return new Promise((resolve, reject) => {
        let sum = 0
        for(let i = 0; i < 1e8; i++) {
            sum += i
        }
        resolve(sum);
    })
}


// fork() creates a completely separate Node.js process.
//
// The child process has its own:
// - PID
// - V8 JavaScript engine
// - Event loop
// - JavaScript heap
// - memory space
//
// Because the CPU-heavy calculation runs in another process,
// it doesn't block the parent process's JavaScript thread.
//
// IMPORTANT:
// A child process is NOT the same thing as a Worker Thread.





// # Load Testing

// loadtest -n 100 -c 50 http://localhost:3000/one

// -n 100 → Total requests
//            Means 100 requests will be sent in total.
//            NOT 100 requests per second.

// -c 50 → Concurrent requests
//          Means up to 50 requests can be in progress
//          at the same time.

// RPS → Requests Per Second
//       Tells us how many requests the server actually
//       completed per second.

// Latency → Time taken by a request to get a response.


// # Restaurant Example 🍽️

// -n 100 → 100 customers want to eat in total.

// -c 50 → Up to 50 customers can be in the restaurant
//          at the same time.

// RPS → How many customers the restaurant serves per second.

// Latency → How long each customer has to wait.


// Remember:

// -n = TOTAL requests
// -c = CONCURRENT requests
// RPS = requests completed per second
// Latency = time taken per request