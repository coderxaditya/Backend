// ========================================================
// CENTRALIZED ERROR HANDLING — EXPRESS
// ========================================================

import express from "express";

const app = express();


// ========================================================
// 1. GLOBAL MIDDLEWARE
// ========================================================
//
// Normal middleware has:
//
//     (req, res, next)
//
// It runs as part of the normal Express pipeline.
//
// Calling:
//
//     next()
//
// tells Express:
//
// "Everything is fine. Continue."
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
// Example:
//
// POST /users
//
// {
//     "name": "Aditya"
// }
//
// Then:
//
//     req.body
//
// contains the parsed object.
// ========================================================

app.use(express.json());


// ========================================================
// 3. NORMAL ROUTE
// ========================================================
//
// This route demonstrates the normal successful flow.
// ========================================================

app.get("/", (req, res) => {

    res.status(200).json({
        message: "API is working"
    });

});


// ========================================================
// 4. BAD REQUEST EXAMPLE
// ========================================================
//
// 400 means:
//
// "The client sent an invalid request."
//
// This is a CLIENT-SIDE problem, not an unexpected
// server failure.
// ========================================================

app.get("/bad-request", (req, res) => {

    res.status(400).json({
        error: "Bad request"
    });

});


// ========================================================
// 5. ROUTE THAT INTENTIONALLY CREATES AN ERROR
// ========================================================
//
// We are intentionally throwing an error so that we can
// demonstrate centralized error handling.
//
// In a real application, an error could come from:
//
//     Database
//     External API
//     File system
//     Business logic
//     Validation
//     etc.
// ========================================================

app.get("/error", (req, res, next) => {

    try {

        // Pretend something unexpected happened.

        throw new Error(
            "Database connection failed"
        );

    } catch (error) {

        // IMPORTANT:
        //
        // next() normally means:
        //
        //     "Continue normally."
        //
        // But:
        //
        // next(error)
        //
        // means:
        //
        //     "An error occurred.
        //      Enter the error-handling pipeline."

        next(error);

    }

});


// ========================================================
// 6. ANOTHER EXAMPLE OF next(error)
// ========================================================
//
// Errors don't necessarily have to come from a try/catch.
//
// We can create an error and pass it directly to
// next(error).
// ========================================================

app.get("/error-direct", (req, res, next) => {

    const error = new Error(
        "Something went wrong"
    );

    // Send the error to the centralized error handler.

    next(error);

});


// ========================================================
// 7. 404 NOT FOUND HANDLER
// ========================================================
//
// IMPORTANT:
//
// This is NOT an error-handler middleware.
//
// It has:
//
//     (req, res)
//
// instead of:
//
//     (error, req, res, next)
//
// If no previous route handled the request, execution
// reaches this middleware.
//
// Example:
//
//     GET /does-not-exist
//
// Since no route matches it, we return 404.
// ========================================================

app.use((req, res) => {

    res.status(404).json({

        error: "Route not found"

    });

});


// ========================================================
// 8. CENTRALIZED ERROR HANDLER
// ========================================================
//
// THIS is special Express middleware.
//
// It MUST have four parameters:
//
//     (error, req, res, next)
//
// The first parameter tells Express:
//
// "This is an error-handling middleware."
//
// Express sends errors here when:
//
//     next(error)
//
// is called.
// ========================================================

app.use((error, req, res, next) => {


    // ----------------------------------------------------
    // SERVER-SIDE ERROR LOGGING
    // ----------------------------------------------------
    //
    // Log the real error on the server.
    //
    // In production this would eventually be handled by
    // a structured logger such as Pino.
    //
    // We generally DON'T expose the full error to clients.
    // ----------------------------------------------------

    console.error(
        "ERROR:",
        error
    );


    // ----------------------------------------------------
    // DETERMINE STATUS CODE
    // ----------------------------------------------------
    //
    // If an error has a statusCode, we can use it.
    //
    // Otherwise, assume this was an unexpected server
    // error and use 500.
    // ----------------------------------------------------

    const statusCode =
        error.statusCode || 500;


    // ----------------------------------------------------
    // SEND SAFE RESPONSE TO CLIENT
    // ----------------------------------------------------
    //
    // We intentionally don't do:
//
//     error: error.stack
//
// or:
//
//     error: error.message
//
// in a production API because the error could contain
// sensitive internal information.
//
// Instead, return a safe generic message.
// ----------------------------------------------------

    if (statusCode >= 500) {

        return res.status(500).json({

            error: "Internal Server Error"

        });

    }


    // For known client-side errors, we can return the
    // appropriate status.
    
    return res.status(statusCode).json({

        error: error.message

    });

});


// ========================================================
// 9. START SERVER
// ========================================================

app.listen(3000, () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});