import { performance } from 'node:perf_hooks';
import argon2 from 'argon2';
import { registerUser, loginUser, needsRehash } from './auth.js';

const KNOWN_EMAIL = 'test@example.com';
const KNOWN_PASSWORD = 'a-very-strong-password';

const median = (xs: number[]) =>
  [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

// ---------------------------------------------------------------
// Part 1 — timing: is there a per-case signal?
// ---------------------------------------------------------------

async function timingTest() {
  await registerUser(KNOWN_EMAIL, KNOWN_PASSWORD);

  const cases = {
    unknown: () => loginUser('unknown@example.com', 'some-password'),
    wrong:   () => loginUser(KNOWN_EMAIL, 'wrong-password'),
    correct: () => loginUser(KNOWN_EMAIL, KNOWN_PASSWORD),
  };

  // Warm up: JIT, libuv thread pool, page faults. Discarded.
  for (let i = 0; i < 10; i++) await cases.wrong();

  const samples: Record<string, number[]> = { unknown: [], wrong: [], correct: [] };

  // Interleaved, so thermal/GC drift spreads evenly across all three
  // instead of landing entirely on whichever block it overlaps.
  for (let i = 0; i < 20; i++) {
    for (const [name, fn] of Object.entries(cases)) {
      const t0 = performance.now();
      await fn();
      samples[name].push(performance.now() - t0);
    }
  }

  console.log('--- login timing (median of 20, interleaved) ---');
  for (const [name, xs] of Object.entries(samples)) {
    console.log(`${name.padEnd(9)} ${median(xs).toFixed(2)} ms`);
  }

  const medians = Object.values(samples).map(median);
  const spread = Math.max(...medians) - Math.min(...medians);
  console.log(`spread    ${spread.toFixed(2)} ms\n`);
}

// ---------------------------------------------------------------
// Part 2 — needsRehash: do outdated parameters get detected?
// ---------------------------------------------------------------

async function rehashTest() {
  console.log('--- needsRehash ---');

  const weak = await argon2.hash(KNOWN_PASSWORD, {
    type: argon2.argon2id,
    timeCost: 2,
    memoryCost: 8192,
  });
  console.log('weak hash  ->', needsRehash(weak), '(expect true)');

  const fresh = (await loginUser(KNOWN_EMAIL, KNOWN_PASSWORD), null);
  const current = await argon2.hash(KNOWN_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 7,
  });
  console.log('fresh hash ->', needsRehash(current), '(expect false)');

  // The old hash still verifies — that's the point. Parameters live inside
  // the hash string, so upgrading them never invalidates existing passwords.
  console.log('weak still verifies ->', await argon2.verify(weak, KNOWN_PASSWORD));
}

await timingTest();
await rehashTest();