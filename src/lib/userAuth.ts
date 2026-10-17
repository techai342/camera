/**
 * User Authentication Engine for Supashort App Users
 * - PBKDF2 with SHA-256 (100,000 iterations) per-user salt
 * - HMAC-SHA256 Signed Session Tokens
 * - Web Crypto API compatible (Node.js & Edge Runtime)
 */

export const USER_COOKIE_NAME = 'app_user_session';
const USER_SESSION_SECRET = process.env.USER_SESSION_SECRET || 'supashort_app_user_secret_vault_key_2026_xyz';
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * Constant-time string equality check to prevent timing attacks
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a salt for the user
 */
function getSaltForUser(username: string): string {
  return `supashort_user_salt_${username.trim().toLowerCase()}_2026_sec`;
}

/**
 * Derive 256-bit PBKDF2-SHA256 hash using 100,000 iterations
 */
export async function hashUserPassword(password: string, username: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = getSaltForUser(username);
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  const bytes = new Uint8Array(bits);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify given password against stored PBKDF2 hash
 */
export async function verifyUserPassword(password: string, username: string, storedHash: string): Promise<boolean> {
  const computedHash = await hashUserPassword(password, username);
  return timingSafeEqualStr(computedHash, storedHash);
}

/**
 * Generate HMAC-SHA256 signature for data string
 */
async function signHMAC(data: string, secret: string = USER_SESSION_SECRET): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const bytes = new Uint8Array(signature);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a cryptographically signed user session token
 */
export async function createUserSessionToken(user: { id: string; username: string }): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Date.now() + SESSION_EXPIRATION_SECONDS * 1000;
  const payload = JSON.stringify({
    id: user.id,
    username: user.username,
    exp: expiresAt,
    iat: Date.now(),
  });

  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = await signHMAC(payloadB64);
  const token = `${payloadB64}.${signature}`;

  return { token, expiresAt };
}

/**
 * Verify signed user session token
 */
export async function verifyUserSessionToken(token: string | undefined | null): Promise<{ valid: boolean; user?: { id: string; username: string } }> {
  if (!token || typeof token !== 'string') {
    return { valid: false };
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false };
  }

  const [payloadB64, signature] = parts;
  const expectedSignature = await signHMAC(payloadB64);

  if (!timingSafeEqualStr(signature, expectedSignature)) {
    return { valid: false };
  }

  try {
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr);

    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
      return { valid: false };
    }

    if (!payload.id || !payload.username) {
      return { valid: false };
    }

    return {
      valid: true,
      user: {
        id: payload.id,
        username: payload.username,
      },
    };
  } catch {
    return { valid: false };
  }
}

/**
 * Extract and verify user session from Request cookies or Authorization header
 */
export async function getUserFromRequest(req: Request): Promise<{ id: string; username: string } | null> {
  let token: string | null = null;

  // 1. Check Cookie header
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    const userCookie = cookies.find(c => c.startsWith(`${USER_COOKIE_NAME}=`));
    if (userCookie) {
      token = userCookie.substring(USER_COOKIE_NAME.length + 1);
    }
  }

  // 2. Check Authorization Bearer header (for API / Mobile clients)
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }

  if (!token) return null;

  const { valid, user } = await verifyUserSessionToken(token);
  return valid && user ? user : null;
}
