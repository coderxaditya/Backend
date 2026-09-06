const fs = require("fs");


// // sync call
// fs.writeFileSync("./test.txt","Hello word !")

// // acync call

// fs.writeFile("./test.txt","Hello Word Async", (err) => {})

// const result = fs.readFileSync("./contact.txt", "utf-8")
// console.log(result);

// // if you use a sync task the output can be stored in a variable

// fs.readFile("./contact.txt", "utf-8", (err, result) => {
//     if (err) {console.log(err);
//     } else {console.log(result);
//     }
// })

// hence async do not retutn something


// fs.appendFileSync("./test.txt", new Date().getDate().toLocaleString())
// fs.appendFileSync("./test.txt", `Hey there\n`)

// // we can create log of users like this => users ip, what request hw made etc etc

// // u can copy a file
// fs.copyFileSync("./test.txt", "./copy.txt")
// // u can delete a file
// fs.unlinkSync("./copy.txt")

// // u can see the stats of a file
// console.log(fs.statSync("./test.txt"))


// // can create folder
// fs.mkdirSync("my-docs")

fs.mkdirSync("my-docss/a/b", {recursive: true})