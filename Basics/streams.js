const fs = require("fs")

// creates a readable stream that reads the contents of large.txt piece by piece,
//  instead of loading the entire file into memory at once.

// const stream = fs.createReadStream("large.txt")
// stream.on("data", (chunk) => {
//     console.log(chunk);
// })
// stream.on("end", () => {
//     console.log("Finish reading the file");
    
// })
// stream.on("error", (err) => {
//     console.log(err);
    
// })



// const readStream = fs.createReadStream("large.txt")
// const writeStream = fs.createWriteStream("copy.txt")

// readStream.pipe(writeStream);



// backpressure
const readStream = fs.createReadStream("large.txt")
const writeStream = fs.createWriteStream("output.txt")

readStream.on("data", (chunk) => {
    // Try to write the chunk to the destination
    const canContinue = writeStream.write(chunk)

    // false means the writable stream's internal buffer is full.
    // Stop reading temporarily.
    if(!canContinue) {
        console.log("Backpressure detected → pausing reader");
        readStream.pause()
    }
})

// 'drain' means the writable stream has processed enough
// buffered data and is ready to receive more.

writeStream.on("drain", () => {
    console.log("Writer caught up → resuming reader");
    readStream.resume();
})

readStream.on("end", () => {
  console.log("Finished reading");

  // Important: tell the writable stream that no more data is coming.
  writeStream.end();
});

readStream.on("error", (err) => {
  console.error("Read error:", err);
});

writeStream.on("error", (err) => {
  console.error("Write error:", err);
});

writeStream.on("finish", () => {
  console.log("Finished writing");
});