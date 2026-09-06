// ============================================================
// SECTION 4 — FS (FILE SYSTEM)
// ============================================================

// `fs` stands for File System.
//
// It allows Node.js to interact with files and directories.
//
// Examples:
//
// - Read files
// - Write files
// - Append files
// - Create directories
// - Read directories
// - Get file metadata
// - Create streams
//
// We will use the Promise-based API because it works
// naturally with async/await.

import fs from "node:fs/promises";


// ------------------------------------------------------------
// 1. WRITE A FILE
// ------------------------------------------------------------

// `writeFile()` creates a file or replaces its contents
// if the file already exists.

await fs.writeFile(
    "example.txt",
    "Hello from Node.js!"
);

console.log("\nFile written successfully.");


// IMPORTANT:
//
// This is asynchronous.
//
// Node can continue handling other work while the
// filesystem operation is being handled.


// ------------------------------------------------------------
// 2. READ A FILE
// ------------------------------------------------------------

// Read the contents of the file.

const fileContents = await fs.readFile(
    "example.txt",
    "utf8"
);

console.log("\nFile contents:");
console.log(fileContents);


// "utf8" tells Node:
//
// "Convert the file's bytes into a UTF-8 string."

//
// Without specifying encoding:
//
// const data = await fs.readFile("example.txt");
//
// Node gives us a Buffer.
//
// This connects directly to what we learned earlier:
//
// File
//   ↓
// Bytes
//   ↓
// Buffer


// ------------------------------------------------------------
// 3. APPEND TO A FILE
// ------------------------------------------------------------

// `appendFile()` adds content to the END of a file.

await fs.appendFile(
    "example.txt",
    "\nThis line was appended."
);

console.log("\nContent appended successfully.");


// ------------------------------------------------------------
// 4. CREATE A DIRECTORY
// ------------------------------------------------------------

// Create a directory.

await fs.mkdir("uploads", {
    recursive: true
});

console.log("\nDirectory created.");


// `recursive: true` means Node can also create
// missing parent directories.
//
// For example:
//
// uploads/images/profile
//
// Node can create all required directories.


// ------------------------------------------------------------
// 5. READ DIRECTORY CONTENTS
// ------------------------------------------------------------

// Get the names of files/directories inside a directory.

const files = await fs.readdir(".");

console.log("\nCurrent directory contents:");
console.log(files);


// Example:
//
// [
//     "app.js",
//     "example.txt",
//     "uploads",
//     "package.json"
// ]


// ------------------------------------------------------------
// 6. fs.access()
// ------------------------------------------------------------

// `access()` can be used to check whether we can access
// a file or directory.

try {

    await fs.access("example.txt");

    console.log("\nexample.txt is accessible.");

} catch (error) {

    console.log("\nexample.txt cannot be accessed.");

}


// IMPORTANT PRODUCTION LESSON:
//
// Avoid unnecessarily doing:
//
// 1. Check if something exists
// 2. Then perform an operation
//
// because something could change between those operations.
//
// Instead, in many situations:
//
// TRY THE OPERATION
// ↓
// HANDLE THE ERROR
//
// This avoids certain race conditions.


// ------------------------------------------------------------
// 7. fs.stat()
// ------------------------------------------------------------

// `stat()` gives us metadata about a file or directory.

const stats = await fs.stat("example.txt");

console.log("\nFile metadata:");
console.log(stats);


// We can inspect individual properties.

console.log("\nFile size in bytes:");
console.log(stats.size);


// Is this a regular file?

console.log("\nIs it a file?");
console.log(stats.isFile());


// Is it a directory?

console.log("\nIs it a directory?");
console.log(stats.isDirectory());


// Last modification time:

console.log("\nLast modified:");
console.log(stats.mtime);


// ------------------------------------------------------------
// 8. SYNCHRONOUS FS OPERATIONS
// ------------------------------------------------------------
//
// Node also provides synchronous APIs:
//
// fs.readFileSync()
// fs.writeFileSync()
// fs.mkdirSync()
// etc.
//
// Example:
//
// import fsSync from "node:fs";
//
// const data = fsSync.readFileSync(
//     "example.txt",
//     "utf8"
// );
//
// IMPORTANT:
//
// Synchronous filesystem operations BLOCK the
// JavaScript thread.
//
// Conceptually:
//
// JavaScript
//     ↓
// readFileSync()
//     ↓
//    BLOCK
//     ↓
// File operation completes
//     ↓
// JavaScript continues
//
// In a backend server handling many requests,
// unnecessary synchronous filesystem operations
// can hurt throughput and latency.
//
// Therefore:
//
// Request handler
//      ↓
// Avoid unnecessary sync filesystem APIs
//
// We'll learn more about this when we build HTTP servers.


// ------------------------------------------------------------
// 9. READ STREAMS FOR LARGE FILES
// ------------------------------------------------------------

// IMPORTANT:
//
// We previously learned that reading an entire large file
// into memory isn't always appropriate.
//
// DON'T casually do:
//
// const hugeFile = await fs.readFile("20gb-file.mp4");
//
// That attempts to load the whole file into memory.
//
// For large files, use STREAMING.
//
// Since `fs/promises` doesn't provide createReadStream(),
// we import it from the regular `fs` module.

import fsSync from "node:fs";

const readStream = fsSync.createReadStream(
    "example.txt"
);


// Listen for chunks.

readStream.on("data", (chunk) => {

    // `chunk` is a Buffer.

    console.log("\nReceived chunk:");
    console.log(chunk);

    console.log("Chunk size in bytes:");
    console.log(chunk.length);
});


// When the entire file has been read:

readStream.on("end", () => {

    console.log("\nFinished reading file.");

});


// Always consider handling stream errors.

readStream.on("error", (error) => {

    console.error(
        "Stream error:",
        error.message
    );

});


// Conceptually:
//
// Large File
//     ↓
// Read Stream
//     ↓
// Buffer / chunk
//     ↓
// Process chunk
//     ↓
// Buffer / chunk
//     ↓
// Process chunk
//     ↓
// ...
//
// This keeps memory usage much more manageable than
// loading the entire file at once.


// ============================================================
// PRODUCTION MENTAL MODEL
// ============================================================
//
// process
//     ↓
// Information/control about the running Node process
//
// os
//     ↓
// Information about the operating system
//
// path
//     ↓
// Safe manipulation of filesystem paths
//
// fs
//     ↓
// Actual interaction with files/directories
//
//
// Together:
//
//                 NODE APPLICATION
//                       │
//          ┌────────────┼────────────┐
//          │            │            │
//       process         os          path
//          │            │            │
//          │            │            └── Path manipulation
//          │            │
//          │            ├── CPU
//          │            ├── Memory
//          │            └── OS
//          │
//          ├── env
//          ├── argv
//          ├── pid
//          ├── cwd
//          └── lifecycle
//
//                       │
//                       ▼
//                      fs
//                       │
//             ┌─────────┼─────────┐
//             │         │         │
//           read      write     streams
//             │         │         │
//             ▼         ▼         ▼
//           Files   Directories  Large Data
//
//
// ============================================================
// IMPORTANT PRODUCTION RULES
// ============================================================
//
// 1. Don't hardcode secrets.
//    Use process.env.
//
// 2. Don't casually use process.exit().
//    Prefer graceful shutdown in production.
//
// 3. Don't construct paths using string concatenation.
//    Use path.join() / path.resolve() appropriately.
//
// 4. Don't blindly trust user-controlled paths.
//    Prevent path traversal.
//
// 5. Don't unnecessarily use synchronous fs operations
//    inside request handlers.
//
// 6. Don't load huge files entirely into memory when
//    streaming is more appropriate.
//
// 7. Handle filesystem errors.
//    Files can disappear, permissions can change,
//    disks can fill up, etc.
//
// 8. Understand the difference between:
//
//    process.cwd()
//    vs
//    the directory where your source file lives.
//
//
// ============================================================
// END
// ============================================================