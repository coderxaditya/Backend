import crypto from 'node:crypto';
import { loginUser } from './auth.js';



type SessionRecord = {
  userId: string,
  createdAt: number,
  lastActivity: number,
}

const sessions = new Map<string, SessionRecord>();

export const createSession = (userId: string): string => {
  const sessionId = crypto.randomBytes(32).toString('base64url')

  const now = Date.now()

  sessions.set(sessionId, {
    userId,
    createdAt: now,
    lastActivity: now,
  })

  return sessionId  
}

const SESSION_CONFIG = {
  absoluteLifetimeMs: 5_000,
  idleLifetimeMs: 2_000,
}


export const getSession = (sessionId: string): SessionRecord | null => {
  const session = sessions.get(sessionId)
  
  if (!session) { return null }
  
  const now = Date.now()
  
  const expiredAbsolute = now - session.createdAt >= SESSION_CONFIG.absoluteLifetimeMs;
  const expiredIdle = now - session.lastActivity >= SESSION_CONFIG.idleLifetimeMs;

  if (expiredAbsolute || expiredIdle) {
    sessions.delete(sessionId)
    return null
  }

  // If the session is still valid
  session.lastActivity = now

  return {...session};
}

export const destroySession = (sessionId: string):void => {
  sessions.delete(sessionId)
}


export const destroyAllForUser = (userId: string): void  => {
  // Scan all sessions because the Map is keyed by sessionId, not userId.
  for (const [sessionId, session] of sessions) {
    // Check whether this session belongs to the specified user.
    if (session.userId === userId) {
      // Delete every session belonging to this user.
      sessions.delete(sessionId);
    }
  }
}


export const login = async (email: string, password: string) => {
  
  const result = await loginUser(email, password)
  
  if (!result.success) {
    return null
  }
  
  return createSession(result.userId)
}


export const createSessionCookie = (sessionId: string): string => {
  
  // Since your configuration is milliseconds but cookie Max-Age uses seconds:
  const maxAge = Math.floor(SESSION_CONFIG.absoluteLifetimeMs / 1000)

  return `sid=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${maxAge}`;
}