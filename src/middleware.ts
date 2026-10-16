import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from './lib/auth';

// In-memory sliding window rate limiter
interface RateLimitRecord {
  timestamps: number[];
}
const rateLimitCache = new Map<string, RateLimitRecord>();

// Clean up stale cache entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitCache.entries()) {
    record.timestamps = record.timestamps.filter(t => now - t < 15 * 60 * 1000);
    if (record.timestamps.length === 0) {
      rateLimitCache.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  let record = rateLimitCache.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitCache.set(key, record);
  }

  // Filter timestamps within window
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfter: Math.max(1, retryAfter) };
  }

  record.timestamps.push(now);
  return { allowed: true, retryAfter: 0 };
}

// Known malicious vulnerability scanner signatures
const BLOCKED_BOT_REGEX = /(sqlmap|nikto|acunetix|masscan|wpscan|dirbuster|nmap|zgrab|morfeus|havij|nessus)/i;

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const method = req.method;
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             req.headers.get('x-real-ip') || 
             '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || '';

  // 1. Attack Signature & Malicious Scanner Shield
  if (BLOCKED_BOT_REGEX.test(userAgent)) {
    return new NextResponse('Access Denied: Malicious activity detected', { status: 403 });
  }

  // Block path traversal and null bytes
  if (pathname.includes('%00') || pathname.includes('..') || pathname.includes('.env') || pathname.includes('.git')) {
    return new NextResponse('Access Denied: Forbidden Path', { status: 403 });
  }

  // 2. Anti-CSRF Origin Check on State-Changing API Requests
  if (['POST', 'PATCH', 'DELETE'].includes(method) && pathname.startsWith('/api/')) {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        // Ensure request comes from same host or trusted internal origin
        if (originUrl.host !== host && !originUrl.host.includes('localhost') && !originUrl.host.includes('127.0.0.1')) {
          return NextResponse.json({ error: 'Cross-Site Request Forgery (CSRF) blocked' }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: 'Malformed Origin Header' }, { status: 400 });
      }
    }
  }

  // 3. Rate Limiting Protection
  // Strict rate limit on Admin Login (Brute-Force Shield: 5 requests per 15 min)
  if (pathname === '/api/admin/auth' && method === 'POST') {
    const rateCheck = checkRateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded: Too many login attempts. Please wait 15 minutes.' },
        { 
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfter.toString(),
          }
        }
      );
    }
  } else if (pathname.startsWith('/api/')) {
    // General API rate limit: 120 requests per minute
    const rateCheck = checkRateLimit(`api:${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { 
          status: 429,
          headers: {
            'Retry-After': rateCheck.retryAfter.toString(),
          }
        }
      );
    }
  }

  // 4. Admin API Protection (Zero Direct API Access without Active Session)
  if (pathname.startsWith('/api/admin/') && pathname !== '/api/admin/auth') {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const { valid } = await verifySessionToken(token);

    if (!valid) {
      return NextResponse.json(
        { error: 'Unauthorized: Valid MrAdmin session required.' },
        { status: 401 }
      );
    }
  }

  // 5. Proceed with Request & Apply Enterprise Security Headers
  const res = NextResponse.next();

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: blob: https:;
    font-src 'self' data: https:;
    connect-src 'self' https://irhqcroczvdkytvvsico.supabase.co https://api.ipify.org https://ipapi.co https://ipwho.is https://freeipapi.com https://upload.imagekit.io https://api.imgbb.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, ' ').trim();

  res.headers.set('Content-Security-Policy', cspHeader);
  res.headers.set('X-Frame-Options', 'DENY'); // 100% Anti-Clickjacking
  res.headers.set('X-Content-Type-Options', 'nosniff'); // Anti-MIME sniffing
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'); // Anti-MITM
  res.headers.set('Permissions-Policy', 'camera=(self), geolocation=(self), microphone=()');
  res.headers.set('X-XSS-Protection', '1; mode=block');

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
