import { registerUser } from './src/auth.js';
import {
  verifyAccessToken,
  loginWithTokens,
  refresh,
  logout,
  logoutEverywhere,
  _debugStoredKeys,
} from './src/jwt.js';

const USER_A = { email: 'alice@example.com', password: 'alice-strong-password' };
const USER_B = { email: 'bob@example.com',   password: 'bob-strong-password-1' };

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const header = (t: string) => console.log(`\n--- ${t} ---`);

function expect(label: string, actual: unknown, expected: unknown) {
  const pass = actual === expected;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label.padEnd(46)} got=${String(actual)}`);
}

async function login(user: { email: string; password: string }) {
  const pair = await loginWithTokens(user.email, user.password);
  if (!pair) throw new Error(`login failed for ${user.email}`);
  return pair;
}

const alive = (token: string) => {
  const next = refresh(token);
  return { ok: next !== null, next };
};

await registerUser(USER_A.email, USER_A.password);
await registerUser(USER_B.email, USER_B.password);

// ---------------------------------------------------------------
// 1. Theft scenario
// ---------------------------------------------------------------
header('1. Theft: attacker rotates first, user replays (waits 2.5s)');

const r1 = (await login(USER_A)).refreshToken;

const attacker = refresh(r1);                      // attacker uses stolen R1
expect('attacker refresh(R1) succeeds', attacker !== null, true);
if (!attacker) throw new Error('setup failed');
const r2 = attacker.refreshToken;

await sleep(2_500);                                // past the grace window

expect('user replays R1', refresh(r1), null);     // tripwire fires
expect("attacker's R2 is now dead", refresh(r2), null);

// ---------------------------------------------------------------
// 2. Hashes at rest
// ---------------------------------------------------------------
header('2. Hashes at rest');

const fresh = (await login(USER_A)).refreshToken;
const keys = _debugStoredKeys();

console.log('raw token (client holds):', fresh);
console.log('stored key (server holds):', keys[keys.length - 1]);
expect('raw token is NOT a stored key', keys.includes(fresh), false);

// ---------------------------------------------------------------
// 3. logout kills the family
// ---------------------------------------------------------------
header('3. logout');

const l1 = (await login(USER_A)).refreshToken;
const l2 = refresh(l1)!.refreshToken;
logout(l2);
expect('refresh after logout', refresh(l2), null);

// ---------------------------------------------------------------
// 4. logoutEverywhere
// ---------------------------------------------------------------
header('4. logoutEverywhere');

const a1 = await login(USER_A);
const a2 = await login(USER_A);
const a3 = await login(USER_A);
const b1 = await login(USER_B);

const aliceId = verifyAccessToken(a1.accessToken)!.userId;
logoutEverywhere(aliceId);

expect('alice session 1', alive(a1.refreshToken).ok, false);
expect('alice session 2', alive(a2.refreshToken).ok, false);
expect('alice session 3', alive(a3.refreshToken).ok, false);
expect('bob session survives', alive(b1.refreshToken).ok, true);

// ---------------------------------------------------------------
// 5. Grace window (waits ~3.5s)
// ---------------------------------------------------------------
header('5. Grace window');

const g1 = (await login(USER_B)).refreshToken;
const g2 = refresh(g1)!.refreshToken;              // g1 used at t0

await sleep(1_000);
expect('replay g1 at 1s (inside grace)', refresh(g1), null);

const step = alive(g2);                            // family must still be alive
expect('family alive after benign reuse', step.ok, true);
const g3 = step.next!.refreshToken;                // g2 used at t1

await sleep(2_500);
expect('replay g2 at 2.5s (outside grace)', refresh(g2), null);   // revokes
expect('g3 dead — family revoked', refresh(g3), null);