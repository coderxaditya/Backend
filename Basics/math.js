// In production there will be so many functions and filed so you have to divide your codebase in modiles
// so you can actully split your code into different files



function add(a, b) {
    return a + b
}

function sub(a, b) {
    return a - b
}



// exports.add = (a, b) => a + b
// exports.sub = (a, b) => a - b
// // .sub and .add is not name of the fun its property
// // therefore you get in termial => { add: [Function (anonymous)], sub: [Function (anonymous)] }


module.exports = {
    add,
    sub,
}

// module.exports = {
//     addFn: add,
//     sunFn: sub,
// }