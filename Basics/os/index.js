// ============================================================
// SECTION 2 — OS
// ============================================================

// The `os` module gives us information about the
// operating system on which Node is running.

import os from "node:os";


// ------------------------------------------------------------
// 1. os.platform()
// ------------------------------------------------------------

// Returns the operating system platform.

console.log("\nOS platform:");
console.log(os.platform());


// Example:
//
// darwin
// linux
// win32


// ------------------------------------------------------------
// 2. os.cpus()
// ------------------------------------------------------------

// Returns information about the logical CPU cores
// available to the operating system.

console.log("\nCPU information:");
console.log(os.cpus());


// Usually we don't need the complete information.
//
// We often just need the number of logical CPUs.

console.log("\nNumber of logical CPU cores:");
console.log(os.cpus().length);


// This becomes important later when we study:
//
// - Worker Threads
// - Cluster
// - CPU-intensive workloads
// - Parallelism


// ------------------------------------------------------------
// 3. os.totalmem()
// ------------------------------------------------------------

// Returns total system memory in BYTES.

const totalMemory = os.totalmem();

console.log("\nTotal memory in bytes:");
console.log(totalMemory);


// Convert bytes → GB.
//
// 1 KB = 1024 bytes
// 1 MB = 1024 KB
// 1 GB = 1024 MB

const totalMemoryGB =
    totalMemory / 1024 / 1024 / 1024;

console.log("Total memory in GB:");
console.log(totalMemoryGB);


// ------------------------------------------------------------
// 4. os.freemem()
// ------------------------------------------------------------

// Returns currently available system memory in BYTES.

const freeMemory = os.freemem();

console.log("\nFree memory in bytes:");
console.log(freeMemory);


// Again, we can convert it to GB.

const freeMemoryGB =
    freeMemory / 1024 / 1024 / 1024;

console.log("Free memory in GB:");
console.log(freeMemoryGB);


// Production note:
//
// Don't build important memory-management decisions
// solely around os.freemem().
//
// Memory availability is dynamic and containers/cloud
// environments can behave differently.


// ------------------------------------------------------------
// 5. os.homedir()
// ------------------------------------------------------------

// Returns the current user's home directory.

console.log("\nHome directory:");
console.log(os.homedir());


// Example:
//
// /Users/aditya
//
// on macOS.


// ------------------------------------------------------------
// 6. os.tmpdir()
// ------------------------------------------------------------

// Returns the operating system's temporary directory.

console.log("\nTemporary directory:");
console.log(os.tmpdir());


// Temporary directories can be useful when an application
// needs temporary files that don't need to live permanently.
