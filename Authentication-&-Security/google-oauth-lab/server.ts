import http from 'node:http';
import crypto from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { createSession, getSession } from './session.js';

// ---------------------------------------------------------------
// Config: fail fast at startup
// ---------------------------------------------------------------

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  throw new Error('Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET — check .env');
}

const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

const AUTHORIZE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));
const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];

const PENDING_TTL_MS = 5 * 60 * 1000;
const SESSION_MAX_AGE_S = 8 * 60 * 60;   // keep in sync with session.ts ABSOLUTE_MS

// SameSite=Lax, NOT Strict: /callback is a top-level navigation coming FROM
// accounts.google.com. Strict withholds cookies on any cross-site request,
// so the pending cookie would be missing and every login would fail.
const PENDING_COOKIE = 'oauth_pending';
const CLEAR_PENDING = `${PENDING_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

// ---------------------------------------------------------------
// Stores
// ---------------------------------------------------------------

type PendingAuth = {
  state: string;
  nonce: string;
  codeVerifier: string;
  createdAt: number;
};

type User = { id: string; email: string; name: string };

const pendingAuths = new Map<string, PendingAuth>();   // pendingId (cookie) → flow
const usersByIdentity = new Map<string, User>();       // `${iss}|${sub}` → User
const usersById = new Map<string, User>();             // user.id → User (for /me)

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

const randomToken = () => crypto.randomBytes(32).toString('base64url');

const sha256b64url = (s: string) =>
  crypto.createHash('sha256').update(s).digest('base64url');

// Constant-time comparison. timingSafeEqual throws on unequal lengths,
// so check that first. Length itself isn't secret here.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

function parseCookies(req: http.IncomingMessage): Record<string, string> {
  const header = req.headers.cookie ?? '';
  return Object.fromEntries(
    header.split(';').map(p => p.trim()).filter(Boolean).map(p => {
      const i = p.indexOf('=');
      return [p.slice(0, i), decodeURIComponent(p.slice(i + 1))];
    }),
  );
}

function sendJson(res: http.ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body, null, 2));
}

function redirect(res: http.ServerResponse, location: string, cookies: string[] = []) {
  res.writeHead(302, { Location: location, 'Set-Cookie': cookies });
  res.end();
}

// The user sees a generic message; the specific reason goes only to the log.
function loginFailed(res: http.ServerResponse, reason: string) {
  console.warn(`[login failed] ${reason}`);
  res.setHeader('Set-Cookie', CLEAR_PENDING);
  sendJson(res, 400, { error: 'Login failed. Please try again.' });
}

function sweepExpiredPending(now: number) {
  for (const [id, p] of pendingAuths) {
    if (now - p.createdAt >= PENDING_TTL_MS) pendingAuths.delete(id);
  }
}

// ---------------------------------------------------------------
// GET /login
// ---------------------------------------------------------------

function handleLogin(req: http.IncomingMessage, res: http.ServerResponse) {
  const now = Date.now();
  sweepExpiredPending(now);

  const state = randomToken();
  const nonce = randomToken();
  const codeVerifier = randomToken();
  const codeChallenge = sha256b64url(codeVerifier);

  const pendingId = randomToken();
  pendingAuths.set(pendingId, { state, nonce, codeVerifier, createdAt: now });

  const url = new URL(AUTHORIZE_URL);
  url.search = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  }).toString();

  const pendingCookie =
    `${PENDING_COOKIE}=${pendingId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${PENDING_TTL_MS / 1000}`;

  // DEBUG (demo 2): ?debug=1 sets the pending cookie but SHOWS the authorize
  // URL instead of redirecting, so you can tamper with `state` by hand.
  // Remove this branch after the demo — it must not ship.
  if (new URL(req.url!, `http://localhost:${PORT}`).searchParams.get('debug') === '1') {
    res.writeHead(200, { 'Content-Type': 'text/plain', 'Set-Cookie': pendingCookie });
    return res.end(url.toString());
  }

  redirect(res, url.toString(), [pendingCookie]);
}

// ---------------------------------------------------------------
// GET /callback
// ---------------------------------------------------------------

async function handleCallback(req: http.IncomingMessage, res: http.ServerResponse) {
  const params = new URL(req.url!, `http://localhost:${PORT}`).searchParams;

  // 1. User cancelled, or Google reported an error.
  const oauthError = params.get('error');
  if (oauthError) return loginFailed(res, `provider returned error=${oauthError}`);

  // 2. Find this browser's pending flow and consume it. Single use: delete
  //    BEFORE any check, so a failed attempt can't be retried with the same record.
  const pendingId = parseCookies(req)[PENDING_COOKIE];
  if (!pendingId) return loginFailed(res, 'no pending-auth cookie on this browser');

  const pending = pendingAuths.get(pendingId);
  pendingAuths.delete(pendingId);

  if (!pending) return loginFailed(res, 'pending-auth record not found (used or expired)');
  if (Date.now() - pending.createdAt >= PENDING_TTL_MS) {
    return loginFailed(res, 'pending-auth record expired');
  }

  const state = params.get('state');

  // DEBUG (demo 2): prefixes only — never log full secrets, even in dev.
  console.log(`[callback] state got=${state?.slice(0, 8)}… expected=${pending.state.slice(0, 8)}…`);

  if (!state || !safeEqual(state, pending.state)) {
    return loginFailed(res, 'state mismatch');
  }

  const code = params.get('code');
  if (!code) return loginFailed(res, 'no authorization code in callback');

  // 3. Exchange the code over the back channel.
  let tokenBody: { id_token?: string; error?: string; error_description?: string };
  try {
    const tokenRes = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        code_verifier: pending.codeVerifier,
      }),
      signal: AbortSignal.timeout(5_000),
    });

    tokenBody = await tokenRes.json();

    if (!tokenRes.ok) {
      return loginFailed(
        res,
        `token exchange ${tokenRes.status}: ${tokenBody.error} (${tokenBody.error_description})`,
      );
    }
  } catch (err) {
    const name = err instanceof Error ? err.name : 'unknown';
    return loginFailed(res, `token exchange failed: ${name}`);   // TimeoutError vs network
  }

  if (!tokenBody.id_token) return loginFailed(res, 'token response had no id_token');

  // 4. Verify the ID token: signature (via JWKS), iss, aud, alg, exp.
  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(tokenBody.id_token, JWKS, {
      issuer: GOOGLE_ISSUERS,
      audience: CLIENT_ID!,
      algorithms: ['RS256'],
    }));
  } catch (err) {
    const code = (err as { code?: string }).code ?? (err as Error).name;
    return loginFailed(res, `id_token verification failed: ${code}`);
  }

  if (typeof payload.nonce !== 'string' || !safeEqual(payload.nonce, pending.nonce)) {
    return loginFailed(res, 'nonce mismatch');
  }
  if (payload.email_verified !== true) {
    return loginFailed(res, 'email not verified by provider');
  }
  if (typeof payload.iss !== 'string' || typeof payload.sub !== 'string') {
    return loginFailed(res, 'id_token missing iss/sub');
  }

  // 5. Upsert on (iss, sub). Never on email.
  const identityKey = `${payload.iss}|${payload.sub}`;
  let user = usersByIdentity.get(identityKey);

  if (user) {
    console.log(`[login] returning user ${user.id} (${user.email})`);
  } else {
    user = {
      id: crypto.randomUUID(),
      email: String(payload.email),
      name: typeof payload.name === 'string' ? payload.name : '',
    };
    usersByIdentity.set(identityKey, user);
    usersById.set(user.id, user);
    console.log(`[login] NEW user ${user.id} (${user.email})`);
  }

  // 6. Google's job is done. From here on it's YOUR session.
  const sid = createSession(user.id);

  redirect(res, '/me', [
    `sid=${sid}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_MAX_AGE_S}`,
    CLEAR_PENDING,
  ]);
}

// ---------------------------------------------------------------
// GET /me
// ---------------------------------------------------------------

function handleMe(req: http.IncomingMessage, res: http.ServerResponse) {
  const sid = parseCookies(req).sid;
  const session = sid ? getSession(sid) : null;
  if (!session) return sendJson(res, 401, { error: 'Not authenticated' });

  const user = usersById.get(session.userId);
  if (!user) return sendJson(res, 401, { error: 'Not authenticated' });

  sendJson(res, 200, user);
}

// ---------------------------------------------------------------
// Router
// ---------------------------------------------------------------

const server = http.createServer(async (req, res) => {
  const path = new URL(req.url!, `http://localhost:${PORT}`).pathname;

  try {
    if (req.method === 'GET' && path === '/login') return handleLogin(req, res);
    if (req.method === 'GET' && path === '/callback') return await handleCallback(req, res);
    if (req.method === 'GET' && path === '/me') return handleMe(req, res);
    sendJson(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error('[unhandled]', err);
    if (!res.headersSent) sendJson(res, 500, { error: 'Internal error' });
  }
});

server.listen(PORT, () => console.log(`→ http://localhost:${PORT}/login`));