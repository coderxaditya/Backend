

export const validateBody = (schema) => {

    return (req, res, next) => {




        const result = schema.safeParse(
            req.body
        );


        if (!result.success) {



            return res.status(400).json({

                error: "Invalid request body",


                details: result.error.issues

            });

        }



        req.body = result.data;


        // Continue to the controller.

        next();

    };

};



export const validateParams = (schema) => {

    return (req, res, next) => {

        const result = schema.safeParse(
            req.params
        );


        if (!result.success) {

            return res.status(400).json({

                error: "Invalid URL parameters",

                details: result.error.issues

            });

        }


        req.params = result.data;



        next();

    };

};



export const validateQuery = (schema) => {

    return (req, res, next) => {

        const result = schema.safeParse(
            req.query
        );


        if (!result.success) {

            return res.status(400).json({

                error: "Invalid query parameters",

                details: result.error.issues

            });

        }


        // Store the validated/transformed query.

        // We don't overwrite req.query because Express treats it as read-only.
        // so you dont do ===>>> req.query = result.data;

        // insted we do
        req.validatedQuery = result.data;
        next();

    };

};