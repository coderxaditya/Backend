import express from 'express';
import { parsePath } from 'react-router-dom';
import { Worker} from 'node:worker_threads';


const app = express();
const port = process.env.PORT || 3000;

app.get("/non-blocking", (req, res) => {
    res.status(200).send("This page is non blocking");
})

app.get("/blocking", (req, res) => {

    const worker = new Worker("./worker.js")

    // Listen for messages coming from the parent thread.
    worker.on("message", (data) => {
        res.status(200).send(`Rest is ${data}`)
    })
    
    worker.on("error", (err) => {
        res.status(400).send(`Error occured ${err}`)
    })
})

app.listen(port, () => {
    console.log(`App is listing on port ${port}`);
    
})