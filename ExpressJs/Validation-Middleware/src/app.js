import express from "express"

import userRouter from "./routes/user.routes.js";

const app = express()

const PORT = 3000;

app.use((req, res, next) => {
    console.log(
        req.method,
        req.originalUrl
    )

    next();
})

app.use(express.json())



app.use("/users", userRouter)



app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    })
})


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})