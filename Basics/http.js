// const http = require("http");

// // Ek HTTP server create karta hai. Jab bhi browser se request aayegi, ye callback chalega:
// let server = http.createServer((req, res) => {
//   // to know from where res came from
//   console.log(req.url, "NerajPepsu");
  
//   // no code will run after this
// //   req.end("hehhe");


//   if (req.url == "/") {
//     res.end("hello");
//   } else if (req.url == "/about") {
//     res.end("abouttt");
//   } else if (req.url == "/contact") {
//     res.end("contact hehehehbhwahahaha");
//   }
// });

// server.listen(3000, () => {
//   console.log("Server chal pada");
// });




// // // // / // / / / crating server with express // / / / // / / / / / / /// / // / 

let express = require('express')
let app = express()

// sequrity guard

app.use((req, res, next)=>{
    console.log("bhoott huu")
    next()
})
// app.use((req, res, next)=>{
//     console.log("dead end")
    
// })


app.get('/', (req, res)=>{
    res.send("hello server")
})

app.post("sfd")

app.listen(3000, () => {
    console.log("Server chal pada");
})