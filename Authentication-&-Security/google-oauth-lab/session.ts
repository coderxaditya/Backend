import crypto from 'node:crypto';

// Keep ABSOLUTE_MS in sync with SESSION_MAX_AGE_S in server.ts,
// or the cookie outlives (or dies before) the server-side session.
export const ABSOLUTE_MS = 8 * 60 * 60 * 1000;   // 8h — forces re-login
export const IDLE_MS     = 30 * 60 * 1000;       // 30min — no activity → expired

export type SessionRecord = {
  userId: string;
  createdAt: number;     // absolute clock, never changes
  lastActivity: number;  // idle clock, slides on each valid read
};

const sessions = new Map<string, SessionRecord>();        // sessionId → record
const userSessions = new Map<string, Set<string>>();      // userId → sessionIds (reverse index)

// ---------------------------------------------------------------

export function createSession(userId: string): string {
  const sessionId = crypto.randomBytes(32).toString('base64url');
  const now = Date.now();

  sessions.set(sessionId, { userId, createdAt: now, lastActivity: now });

  if (!userSessions.has(userId)) userSessions.set(userId, new Set());
  userSessions.get(userId)!.add(sessionId);

  return sessionId;
}

export function getSession(sessionId: string): Readonly<SessionRecord> | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const now = Date.now();

  // Decide everything before mutating anything.
  const expiredAbsolute = now - session.createdAt    >= ABSOLUTE_MS;
  const expiredIdle     = now - session.lastActivity >= IDLE_MS;

  if (expiredAbsolute || expiredIdle) {
    destroySession(sessionId);
    return null;
  }

  session.lastActivity = now;
  return { ...session };   // copy — callers can't mutate the store
}

export function destroySession(sessionId: string): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  sessions.delete(sessionId);
  userSessions.get(session.userId)?.delete(sessionId);
}

// Sign out everywhere: O(this user's sessions), not O(all sessions).
export function destroyAllForUser(userId: string): void {
  const ids = userSessions.get(userId);
  if (!ids) return;

  for (const id of ids) sessions.delete(id);
  userSessions.delete(userId);
}