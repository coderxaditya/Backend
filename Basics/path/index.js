// ============================================================
// SECTION 3 — PATH
// ============================================================

// The `path` module helps us work with filesystem paths.
//
// IMPORTANT:
//
// Never assume every operating system represents paths
// in exactly the same way.
//
// For example:
//
// macOS/Linux:
// uploads/images/photo.jpg
//
// Windows:
// uploads\images\photo.jpg
//
// `path` handles these platform-specific differences.

import path from "node:path";


// ------------------------------------------------------------
// 1. path.join()
// ------------------------------------------------------------

// Combines multiple path segments safely.

const filePath = path.join(
    "uploads",
    "images",
    "profile.jpg"
);

console.log("\nJoined file path:");
console.log(filePath);


// Conceptually:
//
// "uploads"
//      +
// "images"
//      +
// "profile.jpg"
//
// → uploads/images/profile.jpg
//
// On Windows, Node handles the appropriate path separator.


// ------------------------------------------------------------
// 2. path.resolve()
// ------------------------------------------------------------

// `path.resolve()` creates an ABSOLUTE path.

const absolutePath = path.resolve(
    "uploads",
    "images",
    "profile.jpg"
);

console.log("\nAbsolute path:");
console.log(absolutePath);


// Conceptually:
//
// Current Working Directory
//          +
// uploads/images/profile.jpg
//          ↓
// /Users/aditya/project/uploads/images/profile.jpg


// ------------------------------------------------------------
// JOIN vs RESOLVE
// ------------------------------------------------------------
//
// path.join()
// → Combines path segments.
//
// path.resolve()
// → Resolves a path into an absolute path.
//
// Think:
//
// join()
// "Put these pieces together."
//
// resolve()
// "Tell me exactly where this path is."


// ------------------------------------------------------------
// 3. path.basename()
// ------------------------------------------------------------

// Extracts the final component of a path.

console.log("\nFilename:");
console.log(path.basename(filePath));


// Example:
//
// uploads/images/profile.jpg
//                         ↑
//                    profile.jpg


// ------------------------------------------------------------
// 4. path.dirname()
// ------------------------------------------------------------

// Extracts the directory portion.

console.log("\nDirectory:");
console.log(path.dirname(filePath));


// Example:
//
// uploads/images/profile.jpg
// ↑
// uploads/images


// ------------------------------------------------------------
// 5. path.extname()
// ------------------------------------------------------------

// Extracts the file extension.

console.log("\nFile extension:");
console.log(path.extname(filePath));


// Output:
//
// .jpg


// ------------------------------------------------------------
// 6. path.parse()
// ------------------------------------------------------------

// Breaks a path into useful pieces.

console.log("\nParsed path:");
console.log(path.parse(filePath));


// Conceptually:
//
// {
//     root: "",
//     dir: "uploads/images",
//     base: "profile.jpg",
//     ext: ".jpg",
//     name: "profile"
// }


// ------------------------------------------------------------
// PRODUCTION SECURITY WARNING
// ------------------------------------------------------------
//
// NEVER blindly trust user-controlled paths.
//
// Imagine:
//
// const userFilename = "../../../../etc/passwd";
//
// A malicious user might try to escape the directory
// you intended them to use.
//
// This is called:
//
// PATH TRAVERSAL
//
// Therefore, filesystem paths involving user input must
// be carefully validated and constrained.
//
// We'll study security properly later.