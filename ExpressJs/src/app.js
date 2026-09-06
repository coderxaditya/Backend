import express from "express";
import userRouter from "./routes/user.routes.js";

// Import our User Router.
//
// This router contains all routes related to users.



const app = express()

// ========================================================
// 1. GLOBAL MIDDLEWARE
// ========================================================
//
// This middleware runs for requests that reach this point
// in the application.
//
// Because there is no path:
//
//     app.use(middleware)
//
// it is global.
// ========================================================


app.use((req, res, next) => {
    console.log("Global Middleware",
        req.method,
        req.originalUrl
    ),
    

    // Continue to the next middleware / router / route.

    next()
})

// ========================================================
// 2. JSON BODY PARSER
// ========================================================
//
// Allows Express to parse JSON request bodies.
//
// Example:
//
// POST /users
//
// {
//     "name": "Aditya",
//     "email": "aditya@example.com"
// }
//
// After this middleware:
//
//     req.body
//
// contains the parsed JavaScript object.
// ========================================================


app.use(express.json())

// ========================================================
// 3. MOUNT THE USER ROUTER
// ========================================================
//
// This is extremely important.
//
// userRouter contains routes such as:
//
//     router.get("/")
//     router.get("/:id")
//     router.post("/")
//     router.delete("/:id")
//
// We mount that router at:
//
//     /users
//
// Express combines the mount path with the router path.
//
// Example:
//
// Router:      router.get("/")
// Mount:       app.use("/users", userRouter)
//
// Final route:
//
//     GET /users
// ========================================================


app.use("/users", userRouter)


// ========================================================
// 4. 404 FALLBACK
// ========================================================
//
// If none of the registered routes handled the request,
// execution eventually reaches this middleware.
//
// Therefore, we return 404.
// ========================================================

app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
    })
})


// ========================================================
// 5. START SERVER
// ========================================================


app.listen(3000, () => {
    console.log(
        "Server running on http://localhost:3000"
    );
})