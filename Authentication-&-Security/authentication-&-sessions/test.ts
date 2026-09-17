import {
  createSession,
  getSession,
  destroySession,
} from './session.js';

// ---------------------------------------------------------------
// Part 1 — Idle expiry
// ---------------------------------------------------------------

const idleSession = createSession('user-1');

console.log('--- Idle expiry test ---');

console.log('1. Immediately:', getSession(idleSession));

// Wait 2.5 seconds without touching the session.
// Idle timeout = 2 seconds → should expire.
await new Promise(resolve => setTimeout(resolve, 2500));

console.log('2. After 2.5s (idle):', getSession(idleSession));


// ---------------------------------------------------------------
// Part 2 — Absolute expiry
// ---------------------------------------------------------------

const absoluteSession = createSession('user-2');

console.log('\n--- Absolute expiry test ---');

for (let i = 1; i <= 6; i++) {
  // Access every 1 second.
  // This keeps refreshing the idle timeout.
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`${i}s:`, getSession(absoluteSession));
}


// ---------------------------------------------------------------
// Part 3 — Combined expiry test
// ---------------------------------------------------------------

const combinedSession = createSession('user-3');

console.log('\n--- Combined expiry test ---');

console.log('Immediately:', getSession(combinedSession));

for (let i = 1; i <= 5; i++) {
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log(`${i}s:`, getSession(combinedSession));
}


// ---------------------------------------------------------------
// Part 4 — Destroy session
// ---------------------------------------------------------------

const sessionToDestroy = createSession('user-4');

console.log('\n--- Destroy session ---');

console.log(
  'Before destroy:',
  getSession(sessionToDestroy)
);

destroySession(sessionToDestroy);

console.log(
  'After destroy:',
  getSession(sessionToDestroy)
);






////////////////Claudi/////////////////////////

// import {
//   createSession,
//   getSession,
//   destroySession,
// } from './session.js';

// const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// const check = (label: string, id: string) =>
//   console.log(label.padEnd(34), getSession(id) ? 'alive' : 'null');

// // ---------------------------------------------------------------
// // Part 1 — Idle expiry
// // ---------------------------------------------------------------

// const idle = createSession('user-idle');

// console.log('--- Idle expiry test ---');

// check('idle, immediately:', idle);

// await sleep(2_500);

// check('idle, untouched 2.5s:', idle); // expect null


// // ---------------------------------------------------------------
// // Part 2 — Absolute expiry
// // ---------------------------------------------------------------

// const abs = createSession('user-abs');

// console.log('\n--- Absolute expiry test ---');

// for (let i = 1; i <= 4; i++) {
//   await sleep(1_000);

//   check(`absolute, kept warm ${i}s:`, abs);
// }

// await sleep(1_200);

// check('absolute, kept warm 5.2s:', abs); // expect null


// // ---------------------------------------------------------------
// // Part 3 — Combined expiry
// // ---------------------------------------------------------------

// const combined = createSession('user-combined');

// console.log('\n--- Combined expiry test ---');

// check('combined, immediately:', combined);

// await sleep(1_000);
// check('combined, after 1s:', combined);

// await sleep(1_000);
// check('combined, after 2s:', combined);

// await sleep(1_000);
// check('combined, after 3s:', combined);

// await sleep(1_000);
// check('combined, after 4s:', combined);

// await sleep(1_200);
// check('combined, after 5.2s:', combined); // expect null


// // ---------------------------------------------------------------
// // Part 4 — Destroy / logout
// // ---------------------------------------------------------------

// const out = createSession('user-out');

// console.log('\n--- Destroy session / logout ---');

// check('before destroySession:', out);

// destroySession(out);

// check('after destroySession:', out); // expect null