import http from "node:http";

const server = http.createServer((req, res) => {

    // --------------------------------------------------
    // Parse URL
    // --------------------------------------------------

    const url = new URL(
        req.url,
        `http://${req.headers.host}`
    );

    console.log({
        method: req.method,
        pathname: url.pathname,
        userAgent: req.headers["user-agent"]
    });


    // --------------------------------------------------
    // GET /users
    // --------------------------------------------------

    if (
        req.method === "GET" &&
        url.pathname === "/users"
    ) {

        const page =
            url.searchParams.get("page") ?? "1";

        const body = JSON.stringify({
            page,
            users: [
                {
                    id: 1,
                    name: "Aditya"
                }
            ]
        });

        res.statusCode = 200;

        res.setHeader(
            "Content-Type",
            "application/json"
        );

        res.end(body);

        return;
    }


    // --------------------------------------------------
    // DELETE /users/1
    // --------------------------------------------------

    if (
        req.method === "DELETE" &&
        url.pathname === "/users/1"
    ) {

        // No response body.
        res.statusCode = 204;

        res.end();

        return;
    }


    // --------------------------------------------------
    // Route not found
    // --------------------------------------------------

    const body = JSON.stringify({
        error: "Route not found"
    });

    res.statusCode = 404;

    res.setHeader(
        "Content-Type",
        "application/json"
    );

    res.end(body);

});


server.listen(3000, () => {

    console.log(
        "Server running on port 3000"
    );

});