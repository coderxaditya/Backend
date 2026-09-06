import express from "express"
import { email } from "zod";


// ========================================================
// 1. CREATE A ROUTER
// ========================================================
//
// express.Router() creates a modular "mini application"
// that can contain related routes and middleware.
//
// Instead of putting every route inside app.js:
//
//     app.get(...)
//     app.post(...)
//     app.delete(...)
//
// we can keep all user-related routes here.
// ========================================================




const router = express.Router()


const users = [
  { "id": 1, "name": "John Doe", "email": "john.doe@example.com" },
  { "id": 2, "name": "Jane Smith", "email": "jane.smith@example.com" },
  { "id": 3, "name": "Michael Brown", "email": "michael.brown@example.com" },
  { "id": 4, "name": "Emily Davis", "email": "emily.davis@example.com" },
  { "id": 5, "name": "David Wilson", "email": "david.wilson@example.com" },
  { "id": 6, "name": "Sarah Miller", "email": "sarah.miller@example.com" },
  { "id": 7, "name": "James Taylor", "email": "james.taylor@example.com" },
  { "id": 8, "name": "Jessica Anderson", "email": "jessica.anderson@example.com" },
  { "id": 9, "name": "Robert Thomas", "email": "robert.thomas@example.com" },
  { "id": 10, "name": "Amanda Jackson", "email": "amanda.jackson@example.com" }
]


// ========================================================
// 2. ROUTER-LEVEL MIDDLEWARE
// ========================================================
//
// router.use() works similarly to app.use().
//
// But the important difference is:
//
//     app.use()
//     → middleware for the application
//
//     router.use()
//     → middleware for this router
//
// Because this middleware is registered on the user router,
// it runs for requests that enter this router.
// ========================================================

router.use((req, res, next) => {
    console.log(
        "User Router Middleware:",
        req.method,
        req.originalUrl
    );
    
    // Continue to the next middleware / route.

    next()
})



// ========================================================
// 3. GET /users
// ========================================================
//
// Notice that we're writing:
//
//     router.get("/")
//
// NOT:
//
//     router.get("/users")
//
// Why?
//
// Because /users is already provided by:
//
//     app.use("/users", userRouter)
//
// Therefore:
//
//     /users + /
//
// becomes:
//
//     /users
// ========================================================

router.get("/", (req, res) => {
    res.json({
        users: users
    })
})


// ========================================================
// 4. GET /users/:id
// ========================================================
//
// Again, we only write:
//
//     router.get("/:id")
//
// because the /users prefix comes from app.js.
//
// Final route:
//
//     GET /users/123
//
// req.params.id:
//
//     "123"
// ========================================================



router.get("/:id", (req, res) => {
    const userId = req.params.id;

    res.json({
        message: "Get user",
        userId: userId
    })
})





// ========================================================
// 5. POST /users
// ========================================================
//
// Because app.js registered:
//
//     app.use(express.json())
//
// before mounting this router,
// Express can parse JSON request bodies.
//
// Therefore:
//
//     req.body
//
// contains the parsed request body.
// ========================================================


router.post("/create", (req, res) => {

    // users.push(req.body)

    // res.status(201).json({
    //     message: "User created",
    //     user: users
    // });



    // A better approach is to let the server create the ID:
    const newUser = {
        id: users.length + 1,
        name: req.body.name,
        email: req.body.email
    }

    users.push(newUser)

    res.status(201).json({
        message: "User created",
        user: newUser
    })

});


// ========================================================
// 6. DELETE /users/:id
// ========================================================
//
// Router path:
//
//     /:id
//
// Mount path:
//
//     /users
//
// Final endpoint:
//
//     DELETE /users/123
// ========================================================


router.delete("/delete/:id", (req, res) => {

    const userId = Number(req.params.id)
    

    // findIndex() → finds the position
    // splice() → actually modifies users
    const userIdx = users.findIndex(
        user => user.id === userId
    )

    if(userIdx === -1) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    // Start at index userIdx and delete 1 item.
    const deletedUser = users.splice(userIdx, 1)
    // deletedUser is an array.
    // [
    //   {
    //     id: 2,
    //     name: "Jane Smith",
    //     email: "jane.smith@example.com"
    //   }
    // ]



    res.json({
        message: "User deleted",
        user: deletedUser[0],
        users: users
    })
})

// ========================================================
// 7. EXPORT THE ROUTER
// ========================================================
//
// app.js imports this router:
//
//     import userRouter from "./routes/user.routes.js";
//
// ========================================================

export default router