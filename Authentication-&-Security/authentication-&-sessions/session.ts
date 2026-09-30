import crypto from 'node:crypto';
import { loginUser } from './auth.js';

// Represents the server-side information stored for each session.
type SessionRecord = {
  userId: string,
  createdAt: number,
  lastActivity: number,
}

// Map structure:
// sessionId → SessionRecord
const sessions = new Map<string, SessionRecord>();

export function createSession (userId: string): string {
  // Generate a cryptographically secure, random session ID.
  const sessionId = crypto.randomBytes(32).toString('base64url')

  // Use the same timestamp for session creation and initial activity.
  const now = Date.now()
  
  // Store the session on the server using the session ID as the key.
  sessions.set(sessionId, {
    userId,
    createdAt: now,
    lastActivity: now
  })

  // Return the session ID that will represent this login session.
  return sessionId
}


const SESSION_CONFIG = {
  absoluteLifetimeMs: 5_000,
  idleLifetimeMs: 2_000,
};

export function getSession(sessionId: string): SessionRecord | null {
  // Find the session associated with the provided session ID.
  const session = sessions.get(sessionId)
  
  // Session doesn't exist.
  if (!session) {
    return null;
  }

  const now = Date.now()

  const expiredAbsolute = now - session.createdAt   >= SESSION_CONFIG.absoluteLifetimeMs;
  const expiredIdle = now - session.lastActivity >= SESSION_CONFIG.idleLifetimeMs;

  if (expiredAbsolute || expiredIdle) {
    sessions.delete(sessionId);
    return null;
  }

  // 3. Session is valid → slide idle window forward.
  // User activity resets the idle timer.
  session.lastActivity = now;

  // Return the valid session record.
  return { ...session };
  // BUG: Returning the original object lets callers modify the session store directly.
  
  // Example:
  // const session = getSession(id);
  // session.userId = 'admin'; // modifies the actual stored session

  // FIX: Return a copy so external changes don't affect the stored session.

}


export function destroySession(sessionId: string):void {
  // Delete a single session — used for logout.
  sessions.delete((sessionId))
}

export function destroyAllForUser(userId: string): void {
  // Scan all sessions because the Map is keyed by sessionId, not userId.
  for (const [sessionId, session] of sessions) {
    // Check whether this session belongs to the specified user.
    if (session.userId === userId) {
      // Delete every session belonging to this user.
      sessions.delete(sessionId);
    }
  }
}

export async function login(email: string, password: string) {
  // First verify the user's credentials using auth.ts.
  const result = await loginUser(email, password);

  // If authentication fails, do not create a session.
  if (!result.success) {
    return null;
  }

  // Authentication succeeded → create a new session for this user.
  return createSession(result.userId);
}

// Take the session ID and construct the correct Set-Cookie header string.
export function createSessionCookie(sessionId: string): string {
  // Since your configuration is milliseconds but cookie Max-Age uses seconds:
  const maxAge = Math.floor(
    SESSION_CONFIG.absoluteLifetimeMs / 1000
  );

  return `sid=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}