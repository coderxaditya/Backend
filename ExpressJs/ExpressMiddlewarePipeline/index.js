import express from "express"


const app = express()

const loggerMiddleware = (req, res, next) => {
    console.log("Logger");
    
    console.log("Method:", req.method);
    console.log("URL", req.originalUrl);

    next()
}

app.use(loggerMiddleware)



const authMiddleware = (req, res, next) => {
    console.log("Auth");
    
    // Pretend that we decoded a token and identified
    // the currently authenticated user.

    const user = {
        id: 1,
        role: "admin"
    }

    // Middleware can attach information to req.
    req.user = user

    next()
}



const adminMiddleware = (req, res, next) => {
    console.log("admin");

    // req.user was added by authMiddleware.

    if(req.user.role !== "admin") {
        return res.status(403).json({
            error: "Admin access required"
        })
    }
    
    next()
}



app.get("/public", (req, res) => {

    console.log("Public Handler");

    res.json({
        message: "This is a public endpoint"
    });

});



app.get(
    "/profile",

    // Route-specific middleware
    authMiddleware,

    // Route handler
    (req, res) => {

        console.log("Profile Handler");

        res.json({
            message: "This is your profile",

            // req.user was added by authMiddleware.
            user: req.user
        });

    }
);

app.get("/admin/dashboard", authMiddleware, adminMiddleware, (req, res) => {
        console.log("Admin Dashboard Handler");

        res.json({
            message: "Welcome to the admin dashboard",
            user: req.user
        });
})


// 404 FALLBACK
// If no route has sent a response, we can place a fallback
// middleware near the bottom.

// This handles unknown routes.

app.use((req, res) => {

    res.status(404).json({
        error: "Route not found"
    });

});


app.listen(3000, () => {
    console.log("App is running on port 3000");
})









///////////////////////////////////// Commented out code + notes /////////////////////////////////////////////////

// import express from "express";

// const app = express();


// // ========================================================
// // 1. GLOBAL LOGGER MIDDLEWARE
// // ========================================================
// //
// // app.use() registers middleware in the Express pipeline.
// //
// // Because we haven't provided a path:
// //
// //     app.use(middleware)
// //
// // this middleware can run for every request that reaches it.
// //
// // Middleware executes in the order in which it is registered.
// // ========================================================

// const loggerMiddleware = (req, res, next) => {

//     console.log("Logger");

//     console.log("Method:", req.method);
//     console.log("URL:", req.originalUrl);

//     // next() tells Express:
//     //
//     // "This middleware has finished.
//     //  Continue to the next middleware/route."
//     next();

// };


// // Register the global logger.

// app.use(loggerMiddleware);


// // ========================================================
// // 2. AUTHENTICATION MIDDLEWARE
// // ========================================================
// //
// // Authentication answers:
// //
// // "Who is this user?"
// //
// // In a real application, this might verify:
// // - Session
// // - JWT
// // - Access token
// // - etc.
// //
// // For this exercise, we're simply pretending that the
// // authentication succeeded.
// // ========================================================

// const authMiddleware = (req, res, next) => {

//     console.log("Auth");

//     // Pretend that we decoded a token and identified
//     // the currently authenticated user.

//     const user = {
//         id: 1,
//         role: "admin"
//     };


//     // ----------------------------------------------------
//     // Middleware can attach information to req.
//     // ----------------------------------------------------
//     //
//     // This is a very common Express pattern.
//     //
//     // Later middleware and route handlers can access:
//     //
//     //     req.user
//     //
//     // ----------------------------------------------------

//     req.user = user;


//     // User has been authenticated.
//     //
//     // Continue to the next middleware.

//     next();

// };


// // ========================================================
// // 3. ADMIN AUTHORIZATION MIDDLEWARE
// // ========================================================
// //
// // Authentication and authorization are different.
// //
// // Authentication:
// //     "Who are you?"
// //
// // Authorization:
// //     "Are you allowed to perform this action?"
// //
// // This middleware checks whether the authenticated user
// // has the required role.
// // ========================================================

// const adminMiddleware = (req, res, next) => {

//     console.log("Admin");


//     // req.user was added by authMiddleware.

//     if (req.user.role !== "admin") {

//         // We send the response here.
//         //
//         // We DO NOT call next().
//         //
//         // Therefore the request stops here.

//         return res.status(403).json({
//             error: "Admin access required"
//         });

//     }


//     // User is an admin.
//     //
//     // Continue to the route handler.

//     next();

// };


// // ========================================================
// // 4. PUBLIC ROUTE
// // ========================================================
// //
// // /public does NOT require authentication.
// //
// // But our global logger still runs because it was
// // registered using app.use().
// // ========================================================

// app.get("/public", (req, res) => {

//     console.log("Public Handler");

//     res.json({
//         message: "This is a public endpoint"
//     });

// });


// // Request:
// //
// //     GET /public
// //
// // Flow:
// //
// //     Logger
// //       ↓
// //     Public Handler
// //       ↓
// //     Response


// // ========================================================
// // 5. PROFILE ROUTE
// // ========================================================
// //
// // /profile requires authentication.
// //
// // We attach authMiddleware directly to this route.
// //
// // Middleware does NOT have to be registered using app.use().
// // ========================================================

// app.get(
//     "/profile",

//     // Route-specific middleware
//     authMiddleware,

//     // Route handler
//     (req, res) => {

//         console.log("Profile Handler");

//         res.json({
//             message: "This is your profile",

//             // req.user was added by authMiddleware.
//             user: req.user
//         });

//     }
// );


// // Request:
// //
// //     GET /profile
// //
// // Flow:
// //
// //     Logger
// //       ↓
// //     Auth
// //       ↓
// //     Profile Handler
// //       ↓
// //     Response


// // ========================================================
// // 6. ADMIN DASHBOARD
// // ========================================================
// //
// // This route requires TWO middleware functions:
// //
// //     1. Authentication
// //     2. Authorization
// //
// // They execute from left to right.
// // ========================================================

// app.get(
//     "/admin/dashboard",

//     // First:
// //     Who are you?
//     authMiddleware,

//     // Second:
// //     Are you allowed?
//     adminMiddleware,

//     // Finally:
// //     Execute the actual endpoint.
//     (req, res) => {

//         console.log("Admin Dashboard Handler");

//         res.json({
//             message: "Welcome to the admin dashboard",
//             user: req.user
//         });

//     }
// );


// // Request:
// //
// //     GET /admin/dashboard
// //
// // Flow:
// //
// //     Logger
// //       ↓
// //     Auth
// //       ↓
// //     Admin
// //       ↓
// //     Dashboard Handler
// //       ↓
// //     Response


// // ========================================================
// // 7. PATH-SPECIFIC MIDDLEWARE
// // ========================================================
// //
// // app.use("/admin", middleware)
// //
// // means:
// //
// // Run this middleware for requests under /admin.
// //
// // Examples:
// //
// //     /admin
// //     /admin/dashboard
// //     /admin/users
// //
// // can pass through this middleware.
// //
// // Requests such as:
// //
// //     /public
// //     /profile
// //
// // don't match /admin.
// // ========================================================

// app.use("/admin", (req, res, next) => {

//     console.log("Admin Path Middleware");

//     next();

// });


// // IMPORTANT:
// //
// // This middleware was registered AFTER the
// // /admin/dashboard route.
// //
// // Express processes things in registration order.
// //
// // Therefore, it will NOT protect the route above.
// //
// // This demonstrates why middleware order matters.
// //
// // In a real application, if this middleware is intended
// // to protect /admin routes, it should be registered BEFORE
// // the relevant routes.


// // ========================================================
// // 8. MIDDLEWARE THAT TERMINATES A REQUEST
// // ========================================================
// //
// // Middleware doesn't always have to call next().
// //
// // It can terminate a request by sending a response.
// // ========================================================

// const blockedMiddleware = (req, res, next) => {

//     console.log("Blocked Middleware");

//     const allowed = false;


//     if (!allowed) {

//         // Send the response.
//         //
//         // Do NOT call next().
//         //
//         // The request stops here.

//         return res.status(403).json({
//             error: "Access denied"
//         });

//     }


//     // Only reached if allowed === true.

//     next();

// };


// app.get(
//     "/blocked",
//     blockedMiddleware,

//     (req, res) => {

//         // This will NOT execute when allowed === false.

//         res.json({
//             message: "You are allowed"
//         });

//     }
// );


// // ========================================================
// // 9. WHAT HAPPENS IF next() IS NOT CALLED AND NO RESPONSE
// //    IS SENT?
// // ========================================================
// //
// // BAD EXAMPLE:
// //
// // app.use((req, res, next) => {
// //
// //     console.log("Something happened");
// //
// //     // No next()
// //     // No response
// //
// // });
// //
// // The request can hang because Express has no instruction
// // to continue and no response has been sent.
// //
// // NEVER accidentally leave middleware in this state.
// // ========================================================


// // ========================================================
// // 10. MIDDLEWARE ORDER
// // ========================================================
// //
// // Express processes middleware and routes in the exact
// // order in which they are registered.
// //
// // For our application, the important mental model is:
// //
// //
// //
// // Request
// //    ↓
// // Logger
// //    ↓
// // Route matching
// //    ↓
// // Route-specific middleware
// //    ↓
// // Handler
// //    ↓
// // Response
// //
// //
// //
// // And if a middleware sends a response:
// //
// // Request
// //    ↓
// // Middleware
// //    ↓
// // Response
// //    ↓
// // STOP
// //
// //
// //
// // If middleware calls next():
// //
// // Middleware
// //    ↓
// // next()
// //    ↓
// // Next middleware
// // ========================================================


// // ========================================================
// // 11. 404 FALLBACK
// // ========================================================
// //
// // If no route has sent a response, we can place a fallback
// // middleware near the bottom.
// //
// // This handles unknown routes.
// // ========================================================

// app.use((req, res) => {

//     res.status(404).json({
//         error: "Route not found"
//     });

// });


// // ========================================================
// // START SERVER
// // ========================================================

// app.listen(3000, () => {

//     console.log(
//         "Server running on http://localhost:3000"
//     );

// });