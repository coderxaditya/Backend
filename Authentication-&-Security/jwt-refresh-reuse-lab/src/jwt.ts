import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { loginUser } from './auth.js';

// Production: ≥32 random bytes from env, validated at startup.
const JWT_SECRET = 'dev-only-secret-do-not-ship';

const ACCESS_TTL = '10s';
const REFRESH_TTL_MS = 60_000;          // one refresh token's lifetime (idle clock)
const REFRESH_FAMILY_MAX_MS = 180_000;  // whole login's lifetime (absolute clock)
const REUSE_GRACE_MS = 2_000;           // reuse inside this window = benign retry

// ---------------------------------------------------------------
// Types & stores
// ---------------------------------------------------------------

type AccessClaims = jwt.JwtPayload & { sub: string; jti: string };
type TokenPair = { accessToken: string; refreshToken: string };

type Family = {
  userId: string;
  startedAt: number;   // absolute clock — set once at login
  revoked: boolean;
};

type RefreshRecord = {
  familyId: string;
  issuedAt: number;          // idle clock — per token
  usedAt: number | null;     // null = live; number = already rotated
};

const families = new Map<string, Family>();                // familyId → Family
const refreshTokens = new Map<string, RefreshRecord>();    // sha256(token) → record
const userFamilies = new Map<string, Set<string>>();       // userId → familyIds (reverse index)

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

const newOpaqueToken = () => crypto.randomBytes(32).toString('base64url');

// Fast hash is fine here — see question 1 in the exercise.
const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('base64url');

// Mints a refresh token in a family. Stores ONLY the hash; returns the raw
// token, which exists nowhere on the server after this function returns.
function issueRefreshToken(familyId: string, now: number): string {
  const token = newOpaqueToken();
  refreshTokens.set(hashToken(token), { familyId, issuedAt: now, usedAt: null });
  return token;
}

function revokeFamily(familyId: string): void {
  const family = families.get(familyId);
  if (!family || family.revoked) return;

  family.revoked = true;
  userFamilies.get(family.userId)?.delete(familyId);
  // Token records are kept on purpose: a replayed token from a revoked family
  // must still be recognised. Production: Redis TTL cleans them up later.
}

// ---------------------------------------------------------------
// Access tokens (unchanged)
// ---------------------------------------------------------------

export const issueAccessToken = (userId: string): string =>
  jwt.sign(
    { sub: userId, jti: crypto.randomUUID() },
    JWT_SECRET,
    { expiresIn: ACCESS_TTL, algorithm: 'HS256' },
  );

export const verifyAccessToken = (token: string): { userId: string } | null => {
  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    if (typeof payload === 'string' || typeof payload.sub !== 'string') {
      return null;
    }

    const claims = payload as AccessClaims;
    return { userId: claims.sub };
  } catch (error) {
    if (error instanceof Error) console.log(`  [verify] ${error.name}`);
    return null;
  }
};

// ---------------------------------------------------------------
// Login / refresh / logout
// ---------------------------------------------------------------

export const loginWithTokens = async (
  email: string,
  password: string,
): Promise<TokenPair | null> => {
  const result = await loginUser(email, password);
  if (!result.success) return null;

  const now = Date.now();
  const familyId = crypto.randomUUID();

  families.set(familyId, { userId: result.userId, startedAt: now, revoked: false });

  if (!userFamilies.has(result.userId)) userFamilies.set(result.userId, new Set());
  userFamilies.get(result.userId)!.add(familyId);

  return {
    accessToken: issueAccessToken(result.userId),
    refreshToken: issueRefreshToken(familyId, now),
  };
};

export const refresh = (refreshToken: string): TokenPair | null => {
  const record = refreshTokens.get(hashToken(refreshToken));
  if (!record) return null;                       // never issued, or cleaned up

  const family = families.get(record.familyId);
  if (!family || family.revoked) return null;     // family already dead

  const now = Date.now();

  // --- The tripwire ---
  if (record.usedAt !== null) {
    if (now - record.usedAt <= REUSE_GRACE_MS) {
      // Benign: second tab or a network retry. Don't revoke, don't issue.
      // (Some providers return the already-issued successor here instead.)
      return null;
    }
    console.log(`  [refresh] REUSE DETECTED — revoking family ${record.familyId.slice(0, 8)}…`);
    revokeFamily(record.familyId);
    return null;
  }

  // Decide everything before mutating anything.
  const tokenExpired  = now - record.issuedAt  >= REFRESH_TTL_MS;
  const familyExpired = now - family.startedAt >= REFRESH_FAMILY_MAX_MS;

  if (tokenExpired || familyExpired) {
    // This was the family's only live token, so the chain can't continue.
    revokeFamily(record.familyId);
    return null;
  }

  // Production (Redis): "usedAt is null → set usedAt" must be ONE atomic
  // check-and-set (Lua / WATCH+MULTI), or two concurrent requests both pass.
  record.usedAt = now;

  return {
    accessToken: issueAccessToken(family.userId),
    refreshToken: issueRefreshToken(record.familyId, now),
  };
};

// Logout kills the whole login (family), not just the token presented.
export const logout = (refreshToken: string): void => {
  const record = refreshTokens.get(hashToken(refreshToken));
  if (record) revokeFamily(record.familyId);
};

// Uses the reverse index: O(families for this user), not O(all families).
export const logoutEverywhere = (userId: string): void => {
  const ids = userFamilies.get(userId);
  if (!ids) return;
  for (const familyId of [...ids]) revokeFamily(familyId);
  userFamilies.delete(userId);
};

// Test-only: lets the test prove what's actually at rest.
export const _debugStoredKeys = (): string[] => [...refreshTokens.keys()];