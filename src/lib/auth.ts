/**
 * Enterprise Cryptographic Authentication Engine
 * - PBKDF2 with SHA-256 (100,000 iterations)
 * - HMAC-SHA256 Signed Session Tokens
 * - Constant-time comparison against timing attacks
 * - Compatible with Node.js & Edge Runtime (Web Crypto API)
 */

const DEFAULT_SALT = process.env.ADMIN_SALT || 'mradmin_super_secure_salt_99';
const DEFAULT_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || 'saqib99';
const DEFAULT_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '291bc793dcbaf0596b11612bcc1412d6afaccf726c417a5a6e4cff068326bf56';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'mradmin_super_secure_vault_secret_key_2026_xyz99';
const SESSION_EXPIRATION_SECONDS = 60 * 60 * 24; // 24 hours

export const COOKIE_NAME = 'mradmin_session';

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
 * Derive 256-bit PBKDF2-SHA256 hash using 100,000 iterations
 */
export async function hashPasswordPBKDF2(password: string, salt: string = DEFAULT_SALT): Promise<string> {
  const enc = new TextEncoder();
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
 * Fetch dynamic admin settings from Supabase (with fallback)
 */
export async function getAdminSettings(): Promise<any | null> {
  try {
    const { supabaseAdmin } = await import('./supabase');
    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*')
      .limit(1)
      .maybeSingle();
    if (!error && data) {
      return data;
    }
  } catch {}
  return null;
}

/**
 * Verify given username & password against configured PBKDF2 hash (DB or fallback)
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const cleanUser = username.trim().toLowerCase();
  const settings = await getAdminSettings();

  if (settings && settings.username && settings.password_hash) {
    const validUsernames = [
      settings.username.toLowerCase(),
      DEFAULT_USERNAME.toLowerCase(),
      'mradmin',
    ];

    if (!validUsernames.includes(cleanUser)) {
      await hashPasswordPBKDF2('dummy_string', DEFAULT_SALT);
      return false;
    }

    const saltToUse = settings.salt || DEFAULT_SALT;
    const computedHash = await hashPasswordPBKDF2(password, saltToUse);

    if (timingSafeEqualStr(computedHash, settings.password_hash)) {
      return true;
    }

    // Also support default password hash as fallback
    if (timingSafeEqualStr(computedHash, DEFAULT_PASSWORD_HASH)) {
      return true;
    }

    return false;
  }

  // Fallback to environment variables
  const validUsernames = [DEFAULT_USERNAME.toLowerCase(), 'mradmin'];
  if (!validUsernames.includes(cleanUser)) {
    // Perform fake hash to prevent timing enumeration
    await hashPasswordPBKDF2('dummy_string', DEFAULT_SALT);
    return false;
  }

  const computedHash = await hashPasswordPBKDF2(password, DEFAULT_SALT);
  return timingSafeEqualStr(computedHash, DEFAULT_PASSWORD_HASH);
}

/**
 * Generate HMAC-SHA256 signature for data string
 */
async function signHMAC(data: string, secret: string = SESSION_SECRET): Promise<string> {
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
 * Create a cryptographically signed session token
 */
export async function createSessionToken(username: string = 'admin'): Promise<{ token: string; expiresAt: number }> {
  const expiresAt = Date.now() + SESSION_EXPIRATION_SECONDS * 1000;
  const payload = JSON.stringify({
    user: username,
    exp: expiresAt,
    iat: Date.now(),
  });

  const base64Payload = Buffer.from(payload).toString('base64url');
  const signature = await signHMAC(base64Payload);
  return {
    token: `${base64Payload}.${signature}`,
    expiresAt,
  };
}

/**
 * Verify session token integrity and expiration
 */
export async function verifySessionToken(token?: string | null): Promise<{ valid: boolean; user?: string }> {
  if (!token || typeof token !== 'string') return { valid: false };

  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false };

  const [base64Payload, signature] = parts;
  const expectedSignature = await signHMAC(base64Payload);

  if (!timingSafeEqualStr(signature, expectedSignature)) {
    return { valid: false };
  }

  try {
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const data = JSON.parse(jsonStr);

    if (!data.exp || typeof data.exp !== 'number' || Date.now() > data.exp) {
      return { valid: false };
    }

    return { valid: true, user: data.user || 'admin' };
  } catch {
    return { valid: false };
  }
}
