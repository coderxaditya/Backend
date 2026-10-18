import {
  base32Encode, base32Decode, generateSecret,
  hotp, totp, verifyTotp, counterAt,
} from './totp.js';

function expect(label: string, actual: unknown, expected: unknown) {
  const pass = actual === expected;
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${label.padEnd(48)} got=${String(actual)}`);
}
const header = (t: string) => console.log(`\n--- ${t} ---`);

const RFC_SECRET = Buffer.from('12345678901234567890', 'ascii');

// ---------------------------------------------------------------
header('Base32 (RFC 4648)');

expect('encode "foobar"', base32Encode(Buffer.from('foobar')), 'MZXW6YTBOI');
expect('decode "MZXW6YTBOI"', base32Decode('MZXW6YTBOI').toString(), 'foobar');
expect('decode tolerates lowercase + spaces', base32Decode('mzxw 6ytb oi').toString(), 'foobar');

const s = generateSecret();
expect('generated secret round-trips', base32Encode(base32Decode(s)), s);
expect('generated secret is 20 bytes', base32Decode(s).length, 20);

// ---------------------------------------------------------------
header('HOTP vectors (RFC 4226 Appendix D)');

const HOTP_EXPECTED = [
  '755224', '287082', '359152', '969429', '338314',
  '254676', '287922', '162583', '399871', '520489',
];
HOTP_EXPECTED.forEach((code, counter) =>
  expect(`counter ${counter}`, hotp(RFC_SECRET, counter), code),
);

// ---------------------------------------------------------------
header('TOTP vectors (RFC 6238 Appendix B, SHA-1, 8 digits)');

const TOTP_EXPECTED: [number, string][] = [
  [59,          '94287082'],
  [1111111109,  '07081804'],   // leading zero: proves codes are strings
  [1111111111,  '14050471'],
  [1234567890,  '89005924'],
  [2000000000,  '69279037'],
  [20000000000, '65353130'],   // unix seconds > 2^32: catches 32-bit math
];
for (const [seconds, code] of TOTP_EXPECTED) {
  expect(`t=${seconds}`, totp(RFC_SECRET, seconds * 1000, 8), code);
}

// ---------------------------------------------------------------
header('Verifier rules');

const secret = base32Decode(generateSecret());
const NOW = 1_800_000_015_000;          // fixed instant, 15s into a step
const STEP = 30_000;
const current = counterAt(NOW);

const codeNow   = totp(secret, NOW);
const codePrev  = totp(secret, NOW - STEP);
const codeOld   = totp(secret, NOW - 2 * STEP);

const r1 = verifyTotp(secret, codeNow, null, NOW);
expect('current code verifies', r1.ok, true);

expect('previous step verifies (window)', verifyTotp(secret, codePrev, null, NOW).ok, true);

const r3 = verifyTotp(secret, codeOld, null, NOW);
expect('2 steps old fails', r3.ok ? 'ok' : r3.reason, 'invalid');

// Replay: first use succeeds and returns its counter, which we persist.
const lastUsed = r1.ok ? r1.counter : null;
expect('first use returns current counter', lastUsed, current);

const replay = verifyTotp(secret, codeNow, lastUsed, NOW);
expect('same code twice → replay', replay.ok ? 'ok' : replay.reason, 'replay');

// After using the current step, the PREVIOUS step's code must be rejected too.
const back = verifyTotp(secret, codePrev, lastUsed, NOW);
expect('older step after newer used → replay', back.ok ? 'ok' : back.reason, 'replay');

const wrong = codeNow === '000000' ? '111111' : '000000';
const r5 = verifyTotp(secret, wrong, null, NOW);
expect('wrong code fails', r5.ok ? 'ok' : r5.reason, 'invalid');

expect('pasted with a space still works', verifyTotp(secret, `${codeNow.slice(0, 3)} ${codeNow.slice(3)}`, null, NOW).ok, true);

const r7 = verifyTotp(secret, '12345', null, NOW);
expect('5 digits → malformed', r7.ok ? 'ok' : r7.reason, 'malformed');