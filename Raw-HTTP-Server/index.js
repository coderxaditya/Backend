// import http from "node:http"

// const server = http.createServer((req, res) => {
//     res.statusCode = 200;

//     res.setHeader(
//         "Content-Type",
//         "text/plain"
//     );

//     // req.methodtells you what HTTP method the client used.
//     // res.end(req.method);

//     // → Tells you the URL/path the client requested.
//     res.end(req.url);

//     // res.end("Hello from Node HTTP server!");
// })

// server.listen(3000, () => {
//     console.log(
//          "Server running on http://localhost:3000"
//     );
// })


import http from "node:http";

const server = http.createServer((req, res) => {
    console.log("HTTP Method:", req.method);
    console.log("URL:", req.url);

    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET" && req.url === "/") {
        res.statusCode = 200;

        res.end(
            JSON.stringify({
                message: "Welcome to my API"
            })
        );
    }

    else if (req.method === "GET" && req.url === "/users") {
        res.statusCode = 200;

        res.end(
            JSON.stringify({
                users: [
                    {
                        id: 1,
                        name: "Aditya"
                    }
                ]
            })
        );
    }

    else if (req.method === "GET" && req.url === "/products") {
        res.statusCode = 200;

        res.end(
            JSON.stringify({
                products: [
                    {
                        id: 1,
                        name: "MacBook"
                    }
                ]
            })
        );
    }

    else {
        res.statusCode = 404;

        res.end(
            JSON.stringify({
                error: "Route not found"
            })
        );
    }
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});