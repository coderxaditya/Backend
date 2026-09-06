import http from "node:http";

const server = http.createServer((req, res) => {

    const url = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    console.log("Method:", req.method);
    console.log("Path:", url.pathname);

    // --------------------------------------------------------
    // POST /users
    // --------------------------------------------------------

    if (
        req.method === "POST" &&
        url.pathname === "/users"
    ) {

        const chunks = [];

        // Request body arrives as chunks.
        req.on("data", (chunk) => {

            chunks.push(chunk);

        });

        // Body has completely arrived.
        req.on("end", () => {

            try {

                // Combine all Buffer chunks.
                const rawBody = Buffer.concat(chunks);

                // Convert bytes → string.
                const bodyString =
                    rawBody.toString("utf8");

                // Convert JSON string → JavaScript object.
                const body = JSON.parse(bodyString);

                console.log("Received body:", body);

                res.statusCode = 201;

                res.setHeader(
                    "Content-Type",
                    "application/json"
                );

                res.end(
                    JSON.stringify({
                        message: "User created",
                        user: body
                    })
                );

            } catch (error) {

                res.statusCode = 400;

                res.setHeader(
                    "Content-Type",
                    "application/json"
                );

                res.end(
                    JSON.stringify({
                        error: "Invalid JSON"
                    })
                );

            }

        });

        req.on("error", (error) => {

            console.error(
                "Request error:",
                error
            );

        });

        return;
    }


    // --------------------------------------------------------
    // Route not found
    // --------------------------------------------------------

    res.statusCode = 404;

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    res.end(
        JSON.stringify({
            error: "Route not found"
        })
    );

});

server.listen(3000, () => {

    console.log(
        "Server running on http://localhost:3000"
    );

});

    //              HTTP REQUEST
    //                   │
    //       ┌───────────┼────────────┐
    //       ▼           ▼            ▼
    //    method        URL         headers
    //                                │
    //                                ▼
    //                               body
    //                                │
    //                                ▼
    //                        Readable Stream
    //                                │
    //                           ┌────┴────┐
    //                           ▼         ▼
    //                        chunk     chunk
    //                           │         │
    //                           └────┬────┘
    //                                ▼
    //                          Buffer.concat()
    //                                │
    //                                ▼
    //                             String
    //                                │
    //                                ▼
    //                           JSON.parse()
    //                                │
    //                                ▼
    //                         JS Object