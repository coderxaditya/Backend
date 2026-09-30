import argon2 from 'argon2';

// Single source of truth. registerUser and needsRehash must both read this.
const HASH_OPTIONS = {
  type: argon2.argon2id,
  // TODO: pick memoryCost / timeCost. Start near the defaults, then tune:
  memoryCost: 65536,
  timeCost: 7,
  // target ~100-250ms per hash on your machine. Measure before you commit.
} as const;


// // // // Runing a quick benchmark
// const start = performance.now()
// await argon2.hash('test-password', HASH_OPTIONS)
// const end = performance.now()
// console.log(`Hash time: ${(end - start).toFixed(2)} ms`); // => Hash time: 105.39 ms  (for current configuration)



type User = { email: string; passwordHash: string };
const users = new Map<string, User>();

// TODO: a hash of a throwaway password, computed once at module load.
// You'll need this for loginUser. Think about why before you use it.
// 
const DUMMY_HASH = await argon2.hash(
  "dummy-password-that-is-never-used",
  HASH_OPTIONS
)

const normalize = (email: string) => email.trim().toLowerCase();

// // // // - "dummy-password-that-is-never-used" → a fake password we chose ourselves.
// // // // - argon2.hash(...) → hashes that fake password.
// // // // - HASH_OPTIONS → tells Argon2 how to hash it — Argon2id, memory cost, time cost, etc.
// // // // - The resulting hash is stored in DUMMY_HASH.

function validatePassword(password: string): { ok: true } | { ok: false; reason: string } {
  // TODO: your rules. Write down WHY each one exists.
  // One of the common rules is actively counterproductive — decide which and drop it.
  if (password.length < 12) {
    return {
      ok: false,
      reason: 'Password must be at least 12 characters long'
    }
  }
  if (password.length > 128) {
    return {
      ok: false,
      reason: 'Password must not exceed 128 characters'
    };
  }
  return { ok: true };
}

export async function registerUser(email: string, password: string) {
  // TODO: validate -> reject duplicates -> hash -> store
  // Question to answer in your head: should a duplicate email be reported to the caller?
  
  // 1. Validate password
  const validation = validatePassword(password);

  if (!validation.ok) {
    return validation
  }

  const key = normalize(email);
  
  // 2. Reject duplicate email
  // make the duplicate path also perform equivalent expensive work, so existing and non-existing emails take roughly similar time.
  if (users.has(key)) {
    await argon2.hash(password, HASH_OPTIONS) // equalize cost, discard result
    return {
      ok: false,
      reason: 'Unable to register user'
    };
  }

  // 3. Hash password
  const passwordHash = await argon2.hash(password, HASH_OPTIONS)

  users.set(key, {
    email: key,
    passwordHash,
  })
  
  return {
    ok: true
  };
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean }> {
  // TODO: look up the user.
  // The naive version has an early return that makes this function leak.
  // Make the unknown-email path cost the same as the wrong-password path.

  const key = normalize(email);
  const user = users.get(key);
  const hash = user?.passwordHash ?? DUMMY_HASH

  try {
    const valid = await argon2.verify(hash, password)
    return {success: user !== undefined && valid}
  } catch (err){
    console.error('argon2.verify failed', err)
    return {success: false}
  }
  
  // BUG:
  // argon2.verify() does not always return false for a bad hash.
  // If the stored hash is malformed/corrupted, it can THROW an error.
  // Without handling it, the error propagates to the HTTP layer → 500 response
  // and potentially exposes internal error details.
  
  // FIX:
  // Wrap argon2.verify() in try/catch.
  // Log the actual error server-side, but return { success: false } to the client.
}

export function needsRehash(hash: string): boolean {
  // TODO: one library call.
  return argon2.needsRehash(hash, HASH_OPTIONS)
}