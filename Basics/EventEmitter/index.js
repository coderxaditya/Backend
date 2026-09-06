// event-emitter-demo.js

// EventEmitter is built into Node.js.
// "node:events" is the modern, explicit way to import Node's
// built-in events module.
import { EventEmitter } from "node:events";


// ============================================================
// 1. CREATE AN EVENT EMITTER
// ============================================================

// EventEmitter allows different parts of our application to
// communicate using events.
//
// Think:
//
// Producer
//    ↓
// EventEmitter
//    ↓
// Listeners
//
const emitter = new EventEmitter();


// ============================================================
// 2. .on() → REGISTER A LISTENER
// ============================================================

// .on() means:
//
// "Whenever this event happens, run this function."
//
// Here we're listening for the "user.created" event.

emitter.on("user.created", (user) => {
    console.log("Listener 1 → User created:", user.name);
});


// ============================================================
// 3. MULTIPLE LISTENERS FOR THE SAME EVENT
// ============================================================

// An event can have multiple listeners.
//
// This listener has a completely different responsibility.

emitter.on("user.created", (user) => {
    console.log("Listener 2 → Updating analytics for:", user.name);
});


// Another listener.

emitter.on("user.created", (user) => {
    console.log("Listener 3 → Writing audit log for:", user.name);
});


// Conceptually:
//
//                     "user.created"
//                           │
//                           ▼
//                     EventEmitter
//                      /     |     \
//                     /      |      \
//                    ▼       ▼       ▼
//                Listener1 Listener2 Listener3
//
// The producer doesn't need to know what each listener does.


// ============================================================
// 4. .emit() → PUBLISH AN EVENT
// ============================================================

console.log("\n--- Emitting user.created ---");

// .emit() triggers all listeners registered for this event.
//
// We can also pass data to the listeners.

emitter.emit("user.created", {
    id: 101,
    name: "Aditya",
});


// Output will be approximately:
//
// Listener 1 → User created: Aditya
// Listener 2 → Updating analytics for: Aditya
// Listener 3 → Writing audit log for: Aditya


// ============================================================
// 5. EVENTS CAN CARRY MULTIPLE ARGUMENTS
// ============================================================

emitter.on("payment.completed", (paymentId, amount) => {
    console.log(
        `Payment ${paymentId} completed for ₹${amount}`
    );
});


// We can send multiple values using .emit().

emitter.emit("payment.completed", "PAY-123", 500);


// ============================================================
// 6. .once() → LISTEN ONLY ONE TIME
// ============================================================

// Sometimes we only want a listener to execute ONCE.
//
// After the first event, Node automatically removes this listener.

emitter.once("server.ready", () => {
    console.log("Server initialization completed.");
});


// First emit → listener executes.

emitter.emit("server.ready");


// Second emit → listener does NOT execute.

emitter.emit("server.ready");


// Output:
//
// Server initialization completed.
//
// Only once.


// ============================================================
// 7. .off() → REMOVE A LISTENER
// ============================================================

// IMPORTANT:
//
// We store the function in a variable so we have the SAME
// function reference when we want to remove it.

const notificationHandler = (user) => {
    console.log("Sending notification to:", user.name);
};


// Register the listener.

emitter.on("user.notification", notificationHandler);


// Trigger it.

emitter.emit("user.notification", {
    name: "Aditya",
});


// Now remove the listener.

emitter.off("user.notification", notificationHandler);


// This time nothing happens because the listener was removed.

emitter.emit("user.notification", {
    name: "Aditya",
});


// ============================================================
// WHY DO WE NEED THE FUNCTION REFERENCE?
// ============================================================

// This DOES NOT work:
//
// emitter.on("test", () => {
//     console.log("Hello");
// });
//
// emitter.off("test", () => {
//     console.log("Hello");
// });
//
// These are two different function objects.
//
// Instead:
//
// const handler = () => {};
//
// emitter.on("test", handler);
// emitter.off("test", handler);
//
// Same reference → Node knows which listener to remove.


// ============================================================
// 8. EVENTEMITTER IS SYNCHRONOUS
// ============================================================

emitter.on("sync.test", () => {
    console.log("Listener executed");
});

console.log("Before emit");

emitter.emit("sync.test");

console.log("After emit");


// Output:
//
// Before emit
// Listener executed
// After emit
//
// IMPORTANT:
//
// EventEmitter itself is NOT asynchronous.
//
// emit()
//    ↓
// listener runs immediately
//    ↓
// emit() returns
//    ↓
// next line executes


// ============================================================
// 9. ASYNC FUNCTION INSIDE AN EVENT LISTENER
// ============================================================

// An EventEmitter listener can be async.
//
// BUT:
//
// EventEmitter does NOT automatically wait for the Promise.

emitter.on("async.test", async () => {

    // This pauses THIS async function.
    // It does not pause the EventEmitter's emit() call.

    await new Promise((resolve) => {
        setTimeout(resolve, 1000);
    });

    console.log("Async listener finished");
});


console.log("Before async emit");

emitter.emit("async.test");

console.log("After async emit");


// Expected order:
//
// Before async emit
// After async emit
// Async listener finished
//
// Why?
//
// emit()
//   ↓
// async listener starts
//   ↓
// reaches await
//   ↓
// listener yields
//   ↓
// emit() finishes
//   ↓
// "After async emit"
//   ↓
// 1 second later
//   ↓
// "Async listener finished"


// ============================================================
// 10. THE SPECIAL "error" EVENT
// ============================================================

// "error" is special in Node's EventEmitter.
//
// If an EventEmitter emits an "error" event and there is
// NO error listener, Node can treat it as an unhandled error
// and the process may terminate.
//
// Therefore, when an emitter can emit errors, handle them.

emitter.on("error", (error) => {
    console.error("EventEmitter error:", error.message);
});


// Now we can safely emit an error.

emitter.emit(
    "error",
    new Error("Something went wrong")
);


// Output:
//
// EventEmitter error: Something went wrong


// ============================================================
// 11. LISTENER ORDER
// ============================================================

// Listeners registered with .on() are normally called in the
// order in which they were registered.

emitter.on("order.test", () => {
    console.log("Listener A");
});

emitter.on("order.test", () => {
    console.log("Listener B");
});

emitter.on("order.test", () => {
    console.log("Listener C");
});


emitter.emit("order.test");


// Output:
//
// Listener A
// Listener B
// Listener C


// ============================================================
// 12. CHECK HOW MANY LISTENERS EXIST
// ============================================================

// Node provides listener inspection APIs.
//
// This can be useful when debugging listener accumulation.

const orderListeners = emitter.listenerCount("order.test");

console.log(
    "Number of order.test listeners:",
    orderListeners
);


// ============================================================
// 13. MEMORY LEAK / TOO MANY LISTENERS
// ============================================================

// Imagine this function is accidentally called repeatedly.

function registerBadListener() {

    emitter.on("data", () => {
        console.log("Data received");
    });

}


// If this function keeps getting called:
//
// registerBadListener();
// registerBadListener();
// registerBadListener();
// ...
//
// We keep adding listeners.
//
// This can eventually result in:
//
// MaxListenersExceededWarning
//
// IMPORTANT:
//
// The default warning threshold is 10 listeners for one event.
//
// 10 is NOT a hard limit.
//
// Increasing it to something huge:
//
// emitter.setMaxListeners(1000);
//
// does NOT automatically solve the problem.
//
// If listeners keep accumulating unexpectedly,
// investigate WHY they're not being removed.


// ============================================================
// 14. PRODUCTION-SAFE LISTENER MANAGEMENT
// ============================================================

const dataHandler = (data) => {
    console.log("Processing:", data);
};


// Register once.

emitter.on("data", dataHandler);


// Use it.

emitter.emit("data", "Hello");


// Remove it when it is no longer needed.

emitter.off("data", dataHandler);


// This will no longer execute dataHandler.

emitter.emit("data", "World");


// ============================================================
// 15. EVENTEMITTER + DATA FLOW
// ============================================================

// Let's model a small application.
//
// Imagine our application creates a user.
//
// Instead of directly coupling every operation together:
//
// createUser()
//     ↓
// updateAnalytics()
//     ↓
// sendEmail()
//     ↓
// auditLog()
//
// We can publish an event:
//
// createUser()
//     ↓
// "user.created"
//     ↓
// EventEmitter
//     ↓
// ┌───────────────┬───────────────┬───────────────┐
// ▼               ▼               ▼
// Database       Email          Analytics
//
// This is an example of event-driven communication.

emitter.on("account.created", (account) => {
    console.log("Database → Saving account:", account.id);
});

emitter.on("account.created", (account) => {
    console.log("Email → Sending welcome email");
});

emitter.on("account.created", (account) => {
    console.log("Analytics → Tracking account creation");
});


// Publish the event.

emitter.emit("account.created", {
    id: 500,
    email: "user@example.com",
});


// ============================================================
// 16. IMPORTANT: EVENTEMITTER IS IN-PROCESS
// ============================================================

// EventEmitter lives inside the current Node.js process.
//
// Think:
//
// Node Process
// ┌───────────────────────────────────┐
// │                                   │
// │   EventEmitter                    │
// │      │                            │
// │      ├── Listener A               │
// │      ├── Listener B               │
// │      └── Listener C               │
// │                                   │
// └───────────────────────────────────┘
//
// If the Node.js process crashes:
//
// Process
//     ↓
// 💥
// Memory is lost
//
// EventEmitter does NOT provide:
//
// ❌ Persistent events
// ❌ Guaranteed delivery
// ❌ Cross-process messaging
// ❌ Automatic retries
// ❌ Message durability
//
// For those problems, we eventually use systems such as:
//
// Redis Pub/Sub
// RabbitMQ
// Kafka
// BullMQ
//
// We'll study those much later in the curriculum.


// ============================================================
// 17. EVENTEMITTER VS MESSAGE BROKER
// ============================================================
//
// EventEmitter:
//
// Same Node.js process
// Memory-based
// Extremely lightweight
// No persistence
//
// Message broker:
//
// Can communicate between services/processes
// Can provide persistence
// Can provide retries
// Can support distributed consumers
//
// Example:
//
// Service A
//     ↓
// Kafka
//     ↓
// Service B
//
// This is fundamentally different from:
//
// Component A
//     ↓
// EventEmitter
//     ↓
// Component B


// ============================================================
// 18. CONNECTION TO NODE STREAMS
// ============================================================

// Remember our previous lessons:
//
// stream.on("data", ...)
// stream.on("end", ...)
// stream.on("error", ...)
//
// Streams use Node's event-driven model.
//
// Conceptually:
//
// Readable Stream
//       │
//       ▼
// EventEmitter
//       │
//       ├── "data"
//       ├── "end"
//       └── "error"
//
// That's why this works:
//
// const stream = fs.createReadStream("large.txt");
//
// stream.on("data", (chunk) => {
//     console.log(chunk);
// });
//
// The Stream emits events that our application listens to.


// ============================================================
// FINAL MENTAL MODEL
// ============================================================
//
// EventEmitter gives us four fundamental operations:
//
// 1. .on()
//    Subscribe to an event.
//
// 2. .once()
//    Subscribe to an event exactly once.
//
// 3. .emit()
//    Publish/trigger an event.
//
// 4. .off()
//    Unsubscribe/remove a listener.
//
//
//
//                  emit("user.created")
//                           │
//                           ▼
//                    ┌─────────────┐
//                    │ EventEmitter│
//                    └─────────────┘
//                       │    │    │
//                       ▼    ▼    ▼
//                      A     B    C
//
//
// VERY IMPORTANT:
//
// EventEmitter itself is synchronous.
//
// It does NOT automatically:
// - create threads
// - use libuv
// - create Promises
// - make CPU-heavy work asynchronous
// - distribute events across servers
//
// It is simply an in-process event dispatch mechanism.
//
// ============================================================

console.log("\nEventEmitter demonstration completed.");