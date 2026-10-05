import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { loginUser } from './auth.js';

// Production: ≥32 random bytes from env, validated at startup.
const JWT_SECRET = 'dev-only-secret-do-not-ship';

const ACCESS_TTL = '10s';
const REFRESH_TTL_MS = 60_000;          // one refresh token's lifetime (idle clock)
const REFRESH_FAMILY_MAX_MS = 180_000;  // whole login's lifetime (absolute clock)
// const REFRESH_FAMILY_MAX_MS = 15_000;   // testing only

type AccessClaims = jwt.JwtPayload & { sub: string; jti: string };

type RefreshRecord = {
  userId: string;
  issuedAt: number;         // resets on every rotation
  familyStartedAt: number;  // set once at login, never changes
};

type TokenPair = { accessToken: string; refreshToken: string };

const refreshTokens = new Map<string, RefreshRecord>();

const newOpaqueToken = () => crypto.randomBytes(32).toString('base64url');

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
    // Dev visibility. In production: expired → debug, bad signature → warn.
    if (error instanceof Error) console.log(`  [verify] ${error.name}`);
    return null;
  }
};



export const loginWithTokens = async (
  email: string,
  password: string,
): Promise<TokenPair | null> => {
  const result = await loginUser(email, password);
  if (!result.success) return null;   // narrows: result.userId is now string

  const now = Date.now();
  const refreshToken = newOpaqueToken();

  refreshTokens.set(refreshToken, {
    userId: result.userId,
    issuedAt: now,
    familyStartedAt: now,
  });

  return { accessToken: issueAccessToken(result.userId), refreshToken };
};



export const refresh = (refreshToken: string): TokenPair | null => {
  // Production (Redis): this get + delete must be ONE atomic op (GETDEL / Lua),
  // or two concurrent refreshes with the same token both succeed.
  const record = refreshTokens.get(refreshToken);
  if (!record) return null;

  const now = Date.now();

  // Decide everything before mutating anything.
  const tokenExpired  = now - record.issuedAt        >= REFRESH_TTL_MS;
  const familyExpired = now - record.familyStartedAt >= REFRESH_FAMILY_MAX_MS;

  // Single-use: the old token dies whatever happens next.
  refreshTokens.delete(refreshToken);

  if (tokenExpired || familyExpired) return null;

  const newRefreshToken = newOpaqueToken();
  refreshTokens.set(newRefreshToken, {
    userId: record.userId,
    issuedAt: now,
    familyStartedAt: record.familyStartedAt,   // carried forward, NOT reset
  });

  return {
    accessToken: issueAccessToken(record.userId),
    refreshToken: newRefreshToken,
  };
};



export const logout = (refreshToken: string): void => {
  refreshTokens.delete(refreshToken);
};