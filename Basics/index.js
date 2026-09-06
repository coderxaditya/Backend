// console.log("Hye there I am node js");

// when we divide our whole code base into small modules that is called modular programming

// // if you directly write name inside require function, it will find the module in the node directory
// // but if you give part like ./ So it will find it in current directory of yours

// const math = require("fs")
// const math = require("./math");
// const {add, sub} = require("./math")

// // for normally catching in math variable
// console.log(math.add(2, 4));
// console.log(math.sub(2, 4));

// // for fs
// console.log(math);

// // for destructuring
// console.log(add(2, 4));
// console.log(sub(2, 4));

// // for arrow function
// console.log(math.sub(32,23));





// const fs = require("fs");
// const crypto = require("crypto");
// const start = Date.now();

// process.env.UV_THREADPOOL_SIZE = 10

// setTimeout(() => console.log("Hello from Timer 1"), 0);

// setImmediate(() => console.log("Hello from Immediate Fn 1"));

// fs.readFile("sample.txt", "utf-8", () => {
//   console.log("IO Polling Finish");

//   setTimeout(() => console.log("Hello from Timer 2"), 0);
//   setTimeout(() => console.log("Hello from Timer 3"), 5 * 1000);
//   setImmediate(() => console.log("Hello from Immediate Fn 2"));

//   // CPU Intensive task
//   crypto.pbkdf2("password1", "salt1", 100000, 1024, "sha512", () => {
//     console.log(`${Date.now() - start}ms`, "Password 1 Done");
//   });

//   crypto.pbkdf2("password2", "salt1", 100000, 1024, "sha512", () => {
//     console.log(`${Date.now() - start}ms`, "Password 2 Done");
//   });

//   crypto.pbkdf2("password3", "salt1", 100000, 1024, "sha512", () => {
//     console.log(`${Date.now() - start}ms`, "Password 3 Done");
//   });

//   crypto.pbkdf2("password4", "salt1", 100000, 1024, "sha512", () => {
//     console.log(`${Date.now() - start}ms`, "Password 4 Done");
//   });

//   crypto.pbkdf2("password5", "salt1", 100000, 1024, "sha512", () => {
//     console.log(`${Date.now() - start}ms`, "Password 5 Done");
//   });

//   crypto.pbkdf2("password6", "salt1", 100000, 1024, "sha512", () => {
//     console.log(`${Date.now() - start}ms`, "Password 6 Done");
//   });

// });

// console.log("Hello from Top Level Code");








// // // buffer

// const buffer = Buffer.from("Hello")
// console.log(buffer);

// // // Converting Back
// console.log(buffer.toString());

// // // Buffers are Arrays (Almost)
// const buff = Buffer.from("ABC");
// console.log(buff.toString());

// console.log(buffer[0]);
// console.log(buffer[1]);
// console.log(buffer[2]);

// // // You can even modify them.
// buff[0] = 68
// console.log(buff.toString());

// // // // Fixed Size
// const buf = Buffer.alloc(5)
// // // memory
// // // ┌──┬──┬──┬──┬──┐
// // // │0 │0 │0 │0 │0 │
// // // └──┴──┴──┴──┴──┘
// // Exactly 5 bytes.
// // Not 4.
// // Not 6.
// // Fixed.
// // If you need more memory, you create another buffer.


// Buffer Allocation
// There are three ways you'll commonly create buffers.
// 1. Allocate Zero-filled Memory
// Every byte is initialized to 0.
// This is the safe default.

// const buffer = Buffer.alloc(1024);
// console.log(buffer);




// 2. Allocate Without Initialization

// const buffer = Buffer.allocUnsafe(1024);
// console.log(buffer);

// Faster.
// But the memory contains whatever happened to be there previously.
// Example:
// ┌──────────────────────────┐
// │ 83 44 19 200 91 7 ...    │
// └──────────────────────────┘
// Those values are essentially garbage until you overwrite them.




// 3. From Existing Data
const existingArrayBuffer = Buffer.from("Mello")
// Buffer.from("Hello");
// const arr = Buffer.from([65, 66, 67]);
// console.log(arr);

// Buffer.from(existingArrayBuffer);
// console.log(existingArrayBuffer);
// console.log(existingArrayBuffer.length);

// const buffer = Buffer.from("Hello")
// console.log(buffer);
// console.log(buffer[0]);
