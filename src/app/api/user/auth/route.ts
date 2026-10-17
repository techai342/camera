import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import {
  hashUserPassword,
  verifyUserPassword,
  createUserSessionToken,
  getUserFromRequest,
  USER_COOKIE_NAME,
} from '../../../../lib/userAuth';

export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false, user: null });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, username, password } = body;

    if (!username || typeof username !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Both username and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // Username validation: 3-30 chars, alphanumeric + _ -
    if (!/^[a-z0-9_-]{3,30}$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 30 characters (letters, numbers, underscores, and hyphens only).' },
        { status: 400 }
      );
    }

    if (password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters.' },
        { status: 400 }
      );
    }

    // ========================================================
    // ACTION: REGISTER
    // ========================================================
    if (action === 'register') {
      // 1. Check if user already exists
      const { data: existingUser } = await supabase
        .from('app_users')
        .select('id')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        return NextResponse.json(
          { error: `The username "${cleanUsername}" is already taken. Please choose another or sign in.` },
          { status: 409 }
        );
      }

      // 2. Hash password with PBKDF2-SHA256 (100,000 iterations)
      const passwordHash = await hashUserPassword(password, cleanUsername);

      // 3. Create user in Supabase
      const { data: newUser, error: insertError } = await supabase
        .from('app_users')
        .insert([
          {
            username: cleanUsername,
            password_hash: passwordHash,
          },
        ])
        .select('id, username')
        .single();

      if (insertError || !newUser) {
        console.error('Registration DB error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user account. Please make sure the app_users table exists in Supabase.' },
          { status: 500 }
        );
      }

      // 4. Issue session token
      const { token } = await createUserSessionToken({ id: newUser.id, username: newUser.username });

      const response = NextResponse.json({
        success: true,
        message: 'Account created successfully!',
        user: { id: newUser.id, username: newUser.username },
      });

      // Set HTTP-Only Cookie
      response.cookies.set({
        name: USER_COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    // ========================================================
    // ACTION: LOGIN
    // ========================================================
    if (action === 'login') {
      const { data: user, error: queryError } = await supabase
        .from('app_users')
        .select('id, username, password_hash')
        .eq('username', cleanUsername)
        .maybeSingle();

      if (queryError || !user) {
        return NextResponse.json(
          { error: 'Invalid username or password.' },
          { status: 401 }
        );
      }

      const isValid = await verifyUserPassword(password, cleanUsername, user.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid username or password.' },
          { status: 401 }
        );
      }

      // Issue session token
      const { token } = await createUserSessionToken({ id: user.id, username: user.username });

      const response = NextResponse.json({
        success: true,
        message: 'Logged in successfully!',
        user: { id: user.id, username: user.username },
      });

      response.cookies.set({
        name: USER_COOKIE_NAME,
        value: token,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid action specified. Must be register or login.' }, { status: 400 });
  } catch (err: any) {
    console.error('User auth error:', err);
    return NextResponse.json({ error: err.message || 'Authentication service error.' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  response.cookies.set({
    name: USER_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
