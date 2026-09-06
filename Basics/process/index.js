// ============================================================
// NODE.JS BUILT-IN MODULES
// ============================================================
//
// This file demonstrates four important Node.js modules:
//
// 1. process → Information and control over the current Node process
// 2. os      → Information about the operating system
// 3. path    → Safe filesystem path manipulation
// 4. fs      → Reading/writing/managing files and directories
//
// These are all built into Node.js.
// We DON'T need to install them using npm.
//
// ============================================================


// ============================================================
// SECTION 1 — PROCESS
// ============================================================

// `process` is a global Node.js object.
//
// It represents the CURRENTLY RUNNING Node.js process.
//
// Think:
//
// Operating System
//       ↓
// Node.js Process
//       ↓
// Your application
//
// `process` allows us to inspect and interact with that process.


// ------------------------------------------------------------
// 1. process.argv
// ------------------------------------------------------------

// `process.argv` contains command-line arguments.
//
// Try:
//
// node app.js hello world
//
// You will conceptually get:
//
// [
//     "/path/to/node",
//     "/path/to/app.js",
//     "hello",
//     "world"
// ]

console.log("Command-line arguments:");
console.log(process.argv);


// The first item is the Node executable.
// The second item is the JavaScript file being executed.
//
// Additional values are arguments supplied by the user.

const firstArgument = process.argv[2];

console.log("First user argument:", firstArgument);


// ------------------------------------------------------------
// 2. process.env
// ------------------------------------------------------------

// `process.env` contains environment variables.
//
// Example:
//
// PORT=3000 node app.js
//
// Then:
//
// process.env.PORT
//
// will contain:
//
// "3000"
//
// IMPORTANT:
// Environment variables are strings by default.

console.log("\nEnvironment variables:");

console.log("PORT:", process.env.PORT);


// Production example:
//
// const databaseUrl = process.env.DATABASE_URL;
//
// We should NOT hardcode secrets like:
//
// const databaseUrl = "postgresql://username:password@...";
//
// Environment variables keep configuration separate from code.


// ------------------------------------------------------------
// 3. process.cwd()
// ------------------------------------------------------------

// cwd = Current Working Directory
//
// It tells us the directory FROM WHICH the Node process
// was started.
//
// Example:
//
// cd my-project
// node src/server.js
//
// process.cwd()
// → /Users/aditya/my-project

console.log("\nCurrent working directory:");
console.log(process.cwd());


// IMPORTANT:
//
// process.cwd() means:
//
// "Where was the Node process started?"
//
// It does NOT necessarily mean:
//
// "Where is the current JavaScript file?"


// ------------------------------------------------------------
// 4. process.pid
// ------------------------------------------------------------

// Every operating-system process gets a Process ID (PID).

console.log("\nProcess ID:");
console.log(process.pid);


// This becomes useful when debugging running applications
// on Linux/macOS servers or inside containers.


// ------------------------------------------------------------
// 5. process.platform
// ------------------------------------------------------------

// Tells us which operating-system platform Node is running on.
//
// Common values:
//
// darwin → macOS
// linux  → Linux
// win32  → Windows

console.log("\nOperating system platform:");
console.log(process.platform);


// ------------------------------------------------------------
// 6. process.version
// ------------------------------------------------------------

// Gives us the current Node.js version.

console.log("\nNode.js version:");
console.log(process.version);


// This can be useful when debugging:
//
// "Works on my machine"
//
// situations caused by different Node versions.


// ------------------------------------------------------------
// 7. process.exit()
// ------------------------------------------------------------

// `process.exit()` terminates the Node.js process.
//
// 0 conventionally means success.
//
// process.exit(0);
//
// Non-zero values generally represent failure.
//
// process.exit(1);
//
// DO NOT casually call process.exit() inside a production
// request handler.
//
// Abrupt termination can interrupt:
//
// - Active requests
// - Database connections
// - Logs
// - Cleanup operations
// - Other pending work
//
// Later we'll learn GRACEFUL SHUTDOWN, which is the
// production-ready approach.
//
// We are NOT actually calling process.exit() here because
// doing so would stop this demonstration immediately.
