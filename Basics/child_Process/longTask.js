const expensiveCalculation = () => {
    let sum = 0
    for(let i = 0; i < 1e8; i++) {
        sum += i
    }
    return sum;
}

process.on("message", (message) => {
    if(message === "start") {
        const sum = expensiveCalculation();
        // Send the result back to the parent.
        process.send(sum)
        // We are done with this child.
        process.disconnect();
    }
})