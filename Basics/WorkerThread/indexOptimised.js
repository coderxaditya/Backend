// import express from 'express';
// import { parsePath } from 'react-router-dom';
// import { Worker} from 'node:worker_threads';


// const app = express();
// const port = process.env.PORT || 3000;

// const THREAD_COUNT = 4;
// function createWorker() {
//     // we are returning a Promise because the process of creating a worker is performed asycncronously
//     // we want the process of creating 4 worker's to be asycn itself, so the main thread dosen't get blocked
//     return new Promise((resolve, reject) => {
//         // creating worker
//         const worker = new Worker("./workerOptimised.js"), {
//             //  as the second param we can pass some options

//             // if we want to send some data to teh worker we use workerData
//             // inside workerData we will send the thread count
//             workerData : {
//                 thread_count : THREAD_COUNT
//             }
//         }
//     })
// }

// app.get("/non-blocking", (req, res) => {
//     res.status(200).send("This page is non blocking");
// })

// // app.get("/blocking", (req, res) => {

// //     const worker = new Worker("./worker.js")

// //     worker.on("message", (data) => {
// //         res.status(200).send(`Rest is ${data}`)
// //     })
    
// //     worker.on("error", (err) => {
// //         res.status(400).send(`Error occured ${err}`)
// //     })
// // })

// app.listen(port, () => {
//     console.log(`App is listing on port ${port}`);
    
// }) 