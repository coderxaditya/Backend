// import express from "express";

// const app = express()

// app.get("/users", (req, res) => {
//     res.json({
//         message: "Server is working"
//     })
// })

// // Route parameters
// app.get("/users/:id", (req, res) => {

//     console.log(req.params.id);
//     console.log(typeof req.params.id); // string
//     res.json({
//         userId: req.params.id
//     })
// })

// // Query parameters
// app.get("/payment", (req, res) => {
//     console.log(req.query);
//     res.json({
//         page: req.query.page,
//         limit: req.query.limit
//     })
// })

// // Request body
// // This is where Express saves you a lot of manual work.
// // Previously:
// // req.on("data")
// //        ↓
// // chunks
// //        ↓
// // Buffer.concat()
// //        ↓
// // toString()
// //        ↓
// // JSON.parse()

// // With Express:
// app.use(express.json());

// // post
// app.post("/hehe", (req, res) => {

//     console.log(req.body);

//     res.status(201).json({
//         message: "User created",
//         user: req.body
//     });
// });

// app.listen(3000, () => {
//     console.log(
//         "Server running on http://localhost:3000"
//     );
// })








// // Exercise 1 — Express Fundamentals
// import express from "express";

// const app = express();

// const users = [
//   {
//     id: 1,
//     name: "Aditya Bahuguna",
//     email: "aditya@example.com",
//     age: 24,
//   },
//   {
//     id: 2,
//     name: "Rahul Sharma",
//     email: "rahul@example.com",
//     age: 26,
//   },
//   {
//     id: 3,
//     name: "Priya Singh",
//     email: "priya@example.com",
//     age: 23,
//   },
//   {
//     id: 4,
//     name: "Arjun Mehta",
//     email: "arjun@example.com",
//     age: 28,
//   },
//   {
//     id: 5,
//     name: "Neha Kapoor",
//     email: "neha@example.com",
//     age: 25,
//   },
//   {
//     id: 6,
//     name: "Rohan Verma",
//     email: "rohan@example.com",
//     age: 27,
//   },
//   {
//     id: 7,
//     name: "Ananya Joshi",
//     email: "ananya@example.com",
//     age: 22,
//   },
//   {
//     id: 8,
//     name: "Vikram Patel",
//     email: "vikram@example.com",
//     age: 30,
//   },
//   {
//     id: 9,
//     name: "Sneha Gupta",
//     email: "sneha@example.com",
//     age: 24,
//   },
//   {
//     id: 10,
//     name: "Karan Malhotra",
//     email: "karan@example.com",
//     age: 29,
//   },
// ];
// // Global logger
// app.use((req, res, next) => {
//   console.log(req.method, req.url);

//   next();
// });

// // JSON body parser
// app.use(express.json());

// // GET /
// app.get("/", (req, res) => {
//   res.json({
//     message: "API is working",
//   });
// });

// // GET /users?page=2&limit=10
// app.get("/users", (req, res) => {
//   res.json({
//     page: req.query.page,
//     limit: req.query.limit,
//     users,
//   });
// });

// // GET /users/:id
// app.get("/users/:id", (req, res) => {
//   res.json({
//     usersId: req.params.id,
//   });
// });

// // POST /users
// app.post("/users", (req, res) => {
//   console.log(req.body);

//   res.status(201).json({
//     message: "User Created",
//     user: req.body,
//   });
// });

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });








// ////////////////////////Notes/////////////////////////////////////////

import express from "express";

const app = express();


// ========================================================
// 1. GLOBAL MIDDLEWARE
// ========================================================
//
// app.use() registers middleware in Express's request
// processing pipeline.
//
// Because there is NO path specified, this middleware
// can run for every incoming request.
//
// IMPORTANT:
// Middleware executes in the order in which it is registered.
// ========================================================

app.use((req, res, next) => {

    console.log("Global Middleware");

    console.log("Method:", req.method);
    console.log("URL:", req.originalUrl);

    // next() tells Express:
    //
    // "I have finished my work.
    //  Continue to the next middleware/route."
    next();

});


// ========================================================
// 2. JSON BODY PARSING MIDDLEWARE
// ========================================================
//
// express.json() is itself middleware.
//
// It reads an incoming JSON request body and makes the
// parsed JavaScript object available as:
//
//     req.body
//
// Without this middleware, req.body would not be populated
// for JSON requests.
// ========================================================

app.use(express.json());


// ========================================================
// 3. ANOTHER GLOBAL MIDDLEWARE
// ========================================================
//
// This middleware also applies broadly because we used:
//
//     app.use()
//
// Notice that it was registered AFTER the previous
// middleware.
//
// Therefore it executes AFTER the first middleware.
// ========================================================

app.use((req, res, next) => {

    console.log("Second Global Middleware");

    next();

});


// ========================================================
// 4. PATH-SPECIFIC MIDDLEWARE
// ========================================================
//
// app.use("/admin", middleware)
//
// means:
//
// Run this middleware for requests whose path starts
// with /admin.
//
// Examples:
//
//     /admin
//     /admin/users
//     /admin/settings
//
// can pass through this middleware.
//
// A request such as:
//
//     /users
//
// will not pass through this /admin middleware.
// ========================================================

app.use("/admin", (req, res, next) => {

    console.log("Admin Middleware");

    next();

});


// ========================================================
// 5. ROUTE-SPECIFIC MIDDLEWARE
// ========================================================
//
// Middleware does NOT have to be registered using app.use().
//
// We can attach middleware directly to a route.
//
// Here:
//
//     authMiddleware
//
// runs ONLY for:
//
//     GET /users
//
// ========================================================

const authMiddleware = (req, res, next) => {

    console.log("Authentication Middleware");

    const authenticated = true;

    if (!authenticated) {

        // We send a response instead of calling next().
        //
        // This TERMINATES the request.
        //
        // The route handler will NOT execute.

        return res.status(401).json({
            error: "Unauthorized"
        });

    }

    // User is authenticated.
    //
    // Continue to the route handler.

    next();

};


// ========================================================
// 6. GET ROUTE + ROUTE-SPECIFIC MIDDLEWARE
// ========================================================

app.get(
    "/users",

    // This middleware runs first.
    authMiddleware,

    // This is the actual route handler.
    (req, res) => {

        console.log("GET /users Route Handler");

        res.json({
            users: []
        });

    }
);


// ========================================================
// 7. POST ROUTE
// ========================================================
//
// This demonstrates that:
//
// app.post()
//
// is used to define a POST route.
//
// It is NOT the same thing as:
//
// app.use()
//
// app.post() is specifically matching a POST request
// to the specified route.
// ========================================================

app.post("/users", (req, res) => {

    console.log("POST /users Route Handler");

    // Because express.json() was registered earlier:
//
//     app.use(express.json());
//
// Express has already parsed the JSON request body.
//
// Therefore we can access:

    console.log("Request body:", req.body);

    res.status(201).json({
        message: "User created",
        user: req.body
    });

});


// ========================================================
// 8. PATH-SPECIFIC ADMIN ROUTE
// ========================================================
//
// Remember:
//
//     app.use("/admin", ...)
//
// already runs middleware for /admin routes.
//
// Now this route handles a specific endpoint.
// ========================================================

app.get("/admin/dashboard", (req, res) => {

    console.log("Admin Dashboard Handler");

    res.json({
        message: "Welcome to admin dashboard"
    });

});


// ========================================================
// 9. MIDDLEWARE THAT TERMINATES THE REQUEST
// ========================================================
//
// Middleware does NOT have to call next().
//
// It can send a response and stop the request.
//
// Example:
//
//     if something is wrong
//         ↓
//     send response
//         ↓
//     don't call next()
// ========================================================

app.get("/blocked", (req, res, next) => {

    console.log("Blocked middleware");

    const allowed = false;

    if (!allowed) {

        return res.status(403).json({
            error: "Access denied"
        });

    }

    // This would only execute if allowed === true.

    next();

});


// ========================================================
// 10. IMPORTANT: MIDDLEWARE ORDER
// ========================================================
//
// Express processes middleware and routes in the exact
// order they were registered.
//
// Conceptually:
//
// Request
//    ↓
// Global Middleware
//    ↓
// JSON Middleware
//    ↓
// Second Global Middleware
//    ↓
// Admin Middleware (if /admin/*)
//    ↓
// Route-specific Middleware (if applicable)
//    ↓
// Route Handler
//    ↓
// Response
//
// Therefore, changing the order can change the behavior
// of your application.
// ========================================================


// ========================================================
// 11. 404 FALLBACK
// ========================================================
//
// If none of the previous routes handled the request,
// execution reaches this middleware.
//
// We DO NOT call next() because we're ending the request.
//
// This is commonly placed near the bottom of the stack.
// ========================================================

app.use((req, res) => {

    res.status(404).json({
        error: "Route not found"
    });

});


// ========================================================
// 12. START SERVER
// ========================================================

app.listen(3000, () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});