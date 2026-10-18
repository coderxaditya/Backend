import QRCode from 'qrcode';
import { generateSecret, base32Decode, otpauthUri, totp, STEP_SECONDS } from './totp.js';

// Reuse a secret across runs so you don't have to rescan:
//   TOTP_SECRET=XXXX pnpm exec tsx live.ts
const secretB32 = process.env.TOTP_SECRET ?? generateSecret();
const secret = base32Decode(secretB32);

const uri = otpauthUri(secretB32, 'aditya@totp-lab', 'TOTP Lab');

console.log(await QRCode.toString(uri, { type: 'terminal', small: true }));
console.log('Secret (base32):', secretB32);
console.log('Scan the QR with your authenticator app. Ctrl+C to stop.\n');

function tick() {
  const now = Date.now();
  const secondsLeft = STEP_SECONDS - (Math.floor(now / 1000) % STEP_SECONDS);
  console.log(`${new Date(now).toLocaleTimeString()}  code=${totp(secret, now)}  (${secondsLeft}s left)`);
}

tick();
setInterval(tick, 5_000);