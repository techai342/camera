import { NextResponse } from 'next/server';
import { verifyCredentials, createSessionToken, verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

function isRequestSecure(req: Request): boolean {
  const proto = req.headers.get('x-forwarded-proto');
  if (proto) {
    return proto.toLowerCase() === 'https';
  }
  try {
    const url = new URL(req.url);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const isValid = await verifyCredentials(username, password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid security credentials' },
        { status: 401 }
      );
    }

    const { token, expiresAt } = await createSessionToken(username);

    const isSecure = isRequestSecure(req);
    const response = NextResponse.json(
      { success: true, message: 'Handshake authenticated successfully', token },
      { status: 200 }
    );

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      expires: new Date(expiresAt),
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    let token: string | null = null;
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    if (match) token = match[1];

    if (!token) {
      const auth = req.headers.get('authorization');
      if (auth && auth.startsWith('Bearer ')) {
        token = auth.substring(7).trim();
      }
    }

    const { valid, user } = await verifySessionToken(token);
    if (!valid) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const isSecure = isRequestSecure(req);
  const response = NextResponse.json({ success: true, message: 'Session terminated' });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}
