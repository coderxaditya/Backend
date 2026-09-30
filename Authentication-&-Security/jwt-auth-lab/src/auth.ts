import argon2, { type HashOptions } from 'argon2';

import crypto from 'node:crypto';

const HASH_OPTIONS: HashOptions = {
  type: argon2.argon2id,
  memoryCost: 65536,
  timeCost: 7,
}

type User = {
  id: string,
  email: string,
  passwordHash: string,
}

const users = new Map<string, User>();

const DUMMY_HASH = await argon2.hash(
  'dummy-password-that-is-never-used',
  HASH_OPTIONS
)

const normalize = (email: string) => email.trim().toLowerCase()


const validatePassword = (password: string): { ok: true } | { ok: false; reason: string } => {
  if (password.length < 12) {
    return {
      ok: false,
      reason: "Password must be at least 12 characters long",
    }
  }

  if (password.length > 128) {
    return {
      ok: false,
      reason: 'Password must not exceed 128 characters'
    };
  }

  return {ok: true}
}


export const registerUser = async(email: string, password: string) => {
  const validation = validatePassword(password);

  if (!validation.ok) {
    return validation
  }

  const key = normalize(email)
  
  if (users.has(key)) {
    await argon2.hash(password, HASH_OPTIONS)
    return {
      ok: false,
      reason: 'Unable to register user'
    }
  }

  const passwordHash = await argon2.hash(password, HASH_OPTIONS)

  const userId = crypto.randomUUID()
  
  users.set(key, {
    id: userId,
    email: key,
    passwordHash
  })

  return {
    ok: true
  }
}


type LoginResult =
  | { success: true; userId: string }
  | { success: false };

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  
  const key = normalize(email);
  
  const user = users.get(key)

  const hash = user?.passwordHash ?? DUMMY_HASH

  try {
    const valid = await argon2.verify(hash, password)
    
    if (!user || !valid) {
      return { success: false };
    }

    return {
      success: true,
      userId: user.id
    }
    
  } catch (err) {
      console.error('argon2.verify failed', err)
      return {success: false}
  }
}



export const needsRehash = (hash: string): boolean => {
  // This checks whether an existing password hash was created with weaker/different settings than your current HASH_OPTIONS.
  return argon2.needsRehash(hash, HASH_OPTIONS)
}