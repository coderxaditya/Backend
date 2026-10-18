import crypto from 'node:crypto';

// RFC 4648 base32 alphabet. No 0/1/8/9, so no O-vs-0 or l-vs-1 confusion.
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const STEP_SECONDS = 30;
export const DIGITS = 6;

// ---------------------------------------------------------------
// Base32
// ---------------------------------------------------------------

// Packs bytes (8 bits) into base32 characters (5 bits each).
export function base32Encode(buf: Buffer): string {
  let out = '';
  let value = 0;   // bit accumulator
  let bits = 0;    // how many bits in `value` are still unread

  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
    value &= (1 << bits) - 1;   // keep only unread bits, so `value` never overflows
  }

  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31];   // pad final chunk with zeros
  return out;                                                // no '=' padding: authenticator apps don't want it
}

// Tolerates lowercase, spaces, dashes and '=' padding: users paste secrets with all of them.
export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[\s=-]/g, '');
  const out: number[] = [];
  let value = 0;
  let bits = 0;

  for (const ch of clean) {
    const idx = ALPHABET.indexOf(ch);
    if (idx === -1) throw new Error(`invalid base32 character: "${ch}"`);

    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
    value &= (1 << bits) - 1;
  }

  return Buffer.from(out);
}

// ---------------------------------------------------------------
// Secret + provisioning URI
// ---------------------------------------------------------------

// 20 bytes = 160 bits, the size of a SHA-1 output (RFC 4226 recommends ≥128).
export const generateSecret = (): string => base32Encode(crypto.randomBytes(20));

export function otpauthUri(secretB32: string, account: string, issuer: string): string {
  const label = `${encodeURIComponent(issuer)}:${encodeURIComponent(account)}`;
  const params = new URLSearchParams({
    secret: secretB32,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params}`;
}

// ---------------------------------------------------------------
// HOTP (RFC 4226) and TOTP (RFC 6238)
// ---------------------------------------------------------------

export function hotp(secret: Buffer, counter: number, digits = DIGITS): string {
  // 1. Counter as an 8-byte big-endian integer. JS numbers aren't 64-bit ints,
  //    so go through BigInt.
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));

  // 2. HMAC-SHA1 gives 20 bytes.
  const hmac = crypto.createHmac('sha1', secret).update(msg).digest();

  // 3. Dynamic truncation: low 4 bits of the last byte pick an offset (0–15);
  //    read 4 bytes there and drop the sign bit.
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = hmac.readUInt32BE(offset) & 0x7fffffff;

  // 4. Keep the last N decimal digits, as a STRING, with leading zeros intact.
  return String(binary % 10 ** digits).padStart(digits, '0');
}

export const counterAt = (timeMs: number): number =>
  Math.floor(timeMs / 1000 / STEP_SECONDS);   // float division: no 32-bit wraparound

export const totp = (secret: Buffer, timeMs = Date.now(), digits = DIGITS): string =>
  hotp(secret, counterAt(timeMs), digits);

// ---------------------------------------------------------------
// Verification
// ---------------------------------------------------------------

export type VerifyResult =
  | { ok: true; counter: number }
  | { ok: false; reason: 'malformed' | 'invalid' | 'replay' };

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/**
 * Accepts the current step ±1 (clock drift and slow typing).
 * Rejects any code whose step is <= lastUsedCounter (replay).
 * On success the caller MUST persist the returned counter as the new lastUsedCounter.
 */
export function verifyTotp(
  secret: Buffer,
  code: string,
  lastUsedCounter: number | null,
  nowMs = Date.now(),
): VerifyResult {
  const normalized = code.replace(/\s/g, '');   // "123 456" is a common paste
  if (!/^\d{6}$/.test(normalized)) return { ok: false, reason: 'malformed' };

  const current = counterAt(nowMs);

  for (const counter of [current - 1, current, current + 1]) {
    if (!safeEqual(hotp(secret, counter), normalized)) continue;

    // The code is genuine, but it belongs to a step that was already used.
    if (lastUsedCounter !== null && counter <= lastUsedCounter) {
      return { ok: false, reason: 'replay' };
    }
    return { ok: true, counter };
  }

  return { ok: false, reason: 'invalid' };
}