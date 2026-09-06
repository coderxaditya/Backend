// ========================================================
// EXPRESS 5 — ASYNC ERROR HANDLING
// ========================================================

import express from "express";

const app = express();


// ========================================================
// 1. GLOBAL MIDDLEWARE
// ========================================================
//
// This is normal synchronous middleware.
//
// It runs for incoming requests and then calls next()
// to continue the request pipeline.
// ========================================================

app.use((req, res, next) => {

    console.log(
        "Request:",
        req.method,
        req.originalUrl
    );

    // Continue to the next middleware / route.
    next();

});


// ========================================================
// 2. JSON BODY PARSER
// ========================================================
//
// Allows Express to parse JSON request bodies.
//
// This isn't directly related to async error handling,
// but it is commonly part of an Express application.
// ========================================================

app.use(express.json());


// ========================================================
// 3. ASYNC DATABASE SIMULATION
// ========================================================
//
// Imagine this function is actually communicating with
// PostgreSQL.
//
// For this lesson, we're deliberately making it fail.
//
// IMPORTANT:
//
// An async function always returns a Promise.
//
// Therefore:
//
//     throw new Error(...)
//
// inside an async function results in a REJECTED Promise.
// ========================================================

async function getUserFromDatabase(userId) {

    console.log(
        "Fetching user:",
        userId
    );


    // Pretend the database operation failed.

    throw new Error(
        "Database connection failed"
    );

}


// ========================================================
// 4. SUCCESSFUL ASYNC DATABASE SIMULATION
// ========================================================
//
// This function demonstrates the successful path.
//
// It returns a resolved Promise containing user data.
// ========================================================

async function getSuccessfulUser(userId) {

    console.log(
        "Fetching user:",
        userId
    );


    // Simulate a successful database result.

    return {
        id: userId,
        name: "Aditya"
    };

}


// ========================================================
// 5. ASYNC ROUTE — ERROR CASE
// ========================================================
//
// Express 5 supports async route handlers.
//
// We can directly use:
//
//     async (req, res) => {}
//
// without manually wrapping every route in:
//
//     try/catch
//
// If the Promise returned by this handler rejects,
// Express 5 forwards the error to the error-handling
// middleware.
// ========================================================

app.get(
    "/users/1",

    async (req, res) => {

        console.log(
            "GET /users/1"
        );


        // getUserFromDatabase() returns a Promise.
        //
        // The function throws an error.
        //
        // Therefore the Promise rejects.
        //
        // Express 5 detects this rejected Promise and
        // forwards the error to our centralized error
        // handler.

        const user =
            await getUserFromDatabase(1);


        // This line will NEVER execute because the
        // database function failed.

        res.json({
            user
        });

    }

);


// ========================================================
// 6. ASYNC ROUTE — SUCCESS CASE
// ========================================================
//
// This demonstrates that async/await also works normally
// when the Promise resolves successfully.
// ========================================================

app.get(
    "/users/2",

    async (req, res) => {

        console.log(
            "GET /users/2"
        );


        // Promise resolves successfully.

        const user =
            await getSuccessfulUser(2);


        // Execution continues normally.

        res.json({
            user
        });

    }

);


// ========================================================
// 7. ASYNC MIDDLEWARE
// ========================================================
//
// Middleware can also be asynchronous.
//
// Imagine this middleware is checking a session, JWT,
// database, or external authentication service.
// ========================================================

const asyncMiddleware = async (
    req,
    res,
    next
) => {

    console.log(
        "Async middleware running"
    );


    // Imagine an asynchronous operation here.

    await Promise.resolve();


    // Everything succeeded.
    //
    // Continue normally.

    next();

};


// ========================================================
// 8. ROUTE USING ASYNC MIDDLEWARE
// ========================================================

app.get(
    "/async-middleware",

    asyncMiddleware,

    (req, res) => {

        res.json({
            message:
                "Async middleware completed successfully"
        });

    }

);


// ========================================================
// 9. ASYNC MIDDLEWARE THAT FAILS
// ========================================================
//
// Express 5 also handles rejected Promises from async
// middleware.
//
// If this function throws:
//
//     async middleware
//          ↓
//        throw
//          ↓
//    rejected Promise
//          ↓
//      Express 5
//          ↓
//    error handler
// ========================================================

const failingAsyncMiddleware = async (
    req,
    res,
    next
) => {

    console.log(
        "Failing async middleware"
    );


    throw new Error(
        "Authentication service unavailable"
    );

};


// ========================================================
// 10. ROUTE USING FAILING ASYNC MIDDLEWARE
// ========================================================

app.get(
    "/middleware-error",

    failingAsyncMiddleware,

    (req, res) => {

        // This will never execute because the middleware
        // throws an error.

        res.json({
            message: "Success"
        });

    }

);


// ========================================================
// 11. IMPORTANT — next() vs next(error)
// ========================================================
//
// Normal:
//
//     next()
//
// means:
//
//     "Continue normally."
//
// Error:
//
//     next(error)
//
// means:
//
//     "Something went wrong.
//      Enter the error-handling pipeline."
//
// Express 5 also automatically handles rejected Promises
// from async route handlers and middleware.
// ========================================================


// ========================================================
// 12. EXAMPLE OF EXPLICIT next(error)
// ========================================================
//
// You may still encounter situations where you explicitly
// want to pass an error to the error handler.
//
// ========================================================

app.get(
    "/manual-error",

    (req, res, next) => {

        const error = new Error(
            "Manually created error"
        );


        // Explicitly send the error to the centralized
        // error handler.

        next(error);

    }

);


// ========================================================
// 13. DON'T SWALLOW ERRORS
// ========================================================
//
// BAD:
//
// try {
//
//     await databaseOperation();
//
// } catch (error) {
//
//     console.log(error);
//
//     // Nothing else happens.
//
// }
//
// This is called "swallowing" the error.
//
// The application has caught the error but hasn't:
//
//     - handled it
//     - returned a response
//     - or propagated it
//
// In production, this can make failures very difficult
// to diagnose.
// ========================================================


// ========================================================
// 14. 404 HANDLER
// ========================================================
//
// If no route matches the request, execution reaches this
// middleware.
//
// This is NOT an error-handling middleware because it has:
//
//     (req, res)
//
// rather than:
//
//     (error, req, res, next)
// ========================================================

app.use((req, res) => {

    res.status(404).json({
        error: "Route not found"
    });

});


// ========================================================
// 15. CENTRALIZED ERROR HANDLER
// ========================================================
//
// This is special Express middleware.
//
// It has FOUR parameters:
//
//     (error, req, res, next)
//
// Express knows that this is an error handler because of
// this signature.
//
// Errors from:
//
//     next(error)
//     rejected async route handlers
//     rejected async middleware
//
// can reach this middleware.
// ========================================================

app.use((
    error,
    req,
    res,
    next
) => {


    // ----------------------------------------------------
    // LOG THE REAL ERROR SERVER-SIDE
    // ----------------------------------------------------
    //
    // In production, this would eventually be replaced
    // or enhanced with a structured logger such as Pino.
    //
    // The server should know what actually happened.
    // ----------------------------------------------------

    console.error(
        "Internal error:",
        error
    );


    // ----------------------------------------------------
    // DON'T EXPOSE INTERNAL ERROR DETAILS
    // ----------------------------------------------------
    //
    // We don't want to send things like:
    //
    //     database credentials
    //     SQL queries
    //     internal filesystem paths
    //     stack traces
    //
    // to the client in production.
    //
    // Instead, return a safe generic response.
    // ----------------------------------------------------

    res.status(500).json({

        error: "Internal Server Error"

    });

});


app.listen(3000, () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});