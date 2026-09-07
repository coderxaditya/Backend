import express from "express";
import { validateBody, validateParams, validateQuery,  } from "../middleware/validation.middleware.js";
import { createUserSchema, userParamsSchema, userQuerySchema } from "../schemas/user.schema.js";

const router = express.Router()

const users = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];


router.post(
    "/",
    validateBody(createUserSchema),

    (req, res) => {

        // At this point req.body has already passed
        // the Zod schema.

        const user = req.body;

        console.log(
            "Validated user:",
            user
        );
        
        res.status(200).json({
            message: "User Created",
            user
        })
    }
)


router.get(
    "/:id",
    validateParams(userParamsSchema),

    (req, res) => {
        const userId = req.params.id

        console.log(
            "Validated user id:",
            userId
        );
        
        res.json({
            message: "Get Users",
            userId,
            type: typeof userId
        })
    }
)

router.get(
    "/",
    validateQuery(userQuerySchema),

    (req, res) => {
        // We don't overwrite req.query because Express treats it as read-only.
        // so you dont do ===>>> const { page, limit } = req.query;

        // insted we do
        const { page, limit } = req.validatedQuery;


        const skip = (page - 1) * limit

        const paginatedUsers = users.slice(
            skip,
            skip + limit
        )

        console.log("Paginated Users", paginatedUsers);
        

        console.log(
            "Validated query:",
            req.query
        );

        res.json({
            page: page,
            limit: limit,
            paginatedUsers: paginatedUsers,
            
            pageType: typeof page,
            limitType: typeof limit
        })
    }
)

export default router;