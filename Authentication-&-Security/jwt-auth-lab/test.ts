import jwt from 'jsonwebtoken';
import { registerUser } from './src/auth.js';
import {
  issueAccessToken,
  verifyAccessToken,
  loginWithTokens,
  refresh,
  logout,
} from './src/jwt.js';

const EMAIL = 'test@example.com';
const PASSWORD = 'a-very-strong-password';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
const status = (ok: unknown) => (ok ? 'valid' : 'null');

function header(title: string) {
  console.log(`\n--- ${title} ---`);
}

// Small assertion helper so each block says PASS/FAIL instead of making
// you eyeball the output.
function expect(label: string, actual: unknown, expected: unknown) {
  const pass = actual === expected;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label.padEnd(44)} got=${String(actual)}`);
}

async function login() {
  const pair = await loginWithTokens(EMAIL, PASSWORD);
  if (!pair) throw new Error('login failed — is the user registered?');
  return pair;
}

await registerUser(EMAIL, PASSWORD);

// ---------------------------------------------------------------
// Block 0 — wrong password gets no tokens
// ---------------------------------------------------------------
header('Block 0: bad credentials');

const bad = await loginWithTokens(EMAIL, 'wrong-password');
expect('wrong password returns null', bad, null);

// ---------------------------------------------------------------
// Block 4 — forgery (runs FIRST, before any token can expire,
// so a rejection here can only mean the signature check failed)
// ---------------------------------------------------------------
header('Block 4: forgery');

const original = issueAccessToken('user-123');
const [h, , s] = original.split('.');

const b64 = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64url');

// Attack 1: rewrite a claim, keep the original signature.
const claims = jwt.decode(original) as jwt.JwtPayload;
const forged = [h, b64({ ...claims, sub: 'admin' }), s].join('.');

expect('original verifies', status(verifyAccessToken(original)), 'valid');
expect('forged (sub=admin) verifies', status(verifyAccessToken(forged)), 'null');
console.log('decode(forged):', jwt.decode(forged));
// ^ sub: 'admin' — readable, attacker-controlled, and decode() accepts it

// Attack 2: alg:none, no signature at all.
const unsigned = [b64({ alg: 'none', typ: 'JWT' }), b64({ ...claims, sub: 'admin' }), ''].join('.');
expect('alg:none token verifies', status(verifyAccessToken(unsigned)), 'null');
console.log('decode(alg:none):', jwt.decode(unsigned));
// ^ still readable — decode never checks the signature

// ---------------------------------------------------------------
// Block 2 — rotation
// ---------------------------------------------------------------
header('Block 2: rotation');

const a = await login();
const b = refresh(a.refreshToken);

expect('refresh(a) succeeds', b !== null, true);
if (!b) throw new Error('rotation failed, cannot continue');

expect('new access token verifies', status(verifyAccessToken(b.accessToken)), 'valid');
expect('refresh token actually rotated', b.refreshToken !== a.refreshToken, true);
expect('old refresh token is dead', refresh(a.refreshToken), null);

// ---------------------------------------------------------------
// Block 3 — the revocation gap
// ---------------------------------------------------------------
header('Block 3: revocation gap');

logout(b.refreshToken);

// Evaluate first so any [verify] log lines print above the result line.
const refreshAfterLogout = refresh(b.refreshToken);
const accessAfterLogout = verifyAccessToken(b.accessToken);

console.log(
  'after logout →',
  'refresh:', refreshAfterLogout ? 'works' : 'DEAD',
  '| access:', accessAfterLogout ? 'STILL VALID' : 'dead',
);
// Expect: refresh: DEAD | access: STILL VALID
// The access token survives logout until its own exp. That's the gap.

// ---------------------------------------------------------------
// Block 1 — access token expiry
// ---------------------------------------------------------------
header('Block 1: access token expiry (waits 11s)');

const c = await login();
expect('fresh access token', status(verifyAccessToken(c.accessToken)), 'valid');

await sleep(11_000);
expect('after 11s', status(verifyAccessToken(c.accessToken)), 'null');

// ---------------------------------------------------------------
// Block 5 — family (absolute) clock: every refresh succeeds,
// the chain dies anyway. Requires REFRESH_FAMILY_MAX_MS = 15_000.
// ---------------------------------------------------------------
header('Block 5: family clock (waits ~16s)');

let current = (await login()).refreshToken;

for (const t of [5, 10]) {
  await sleep(5_000);
  const next = refresh(current);
  expect(`refresh at ${t}s`, next !== null, true);
  if (!next) throw new Error('chain died early — check your clocks');
  current = next.refreshToken;
}

await sleep(5_500);
expect('refresh at ~15.5s (family expired)', refresh(current), null);