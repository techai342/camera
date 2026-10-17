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
    const { action, username, email, password } = body;

    const identifier = (username || body.identifier || '').trim().toLowerCase();

    if (!identifier || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Credentials are required.' },
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
      const cleanUsername = identifier;
      const cleanEmail = (email || '').trim().toLowerCase();

      // Username validation: 3-30 chars, alphanumeric + _ -
      if (!/^[a-z0-9_-]{3,30}$/.test(cleanUsername)) {
        return NextResponse.json(
          { error: 'Username must be between 3 and 30 characters (letters, numbers, underscores, and hyphens only).' },
          { status: 400 }
        );
      }

      // Email validation (Gmail / standard email)
      if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return NextResponse.json(
          { error: 'Please enter a valid Gmail / Email address.' },
          { status: 400 }
        );
      }

      // 1. Check if username already exists
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

      // 2. Check if email already exists
      try {
        const { data: existingEmail } = await supabase
          .from('app_users')
          .select('id')
          .eq('email', cleanEmail)
          .maybeSingle();

        if (existingEmail) {
          return NextResponse.json(
            { error: `An account with "${cleanEmail}" already exists. Please sign in instead.` },
            { status: 409 }
          );
        }
      } catch {
        // If email column doesn't exist yet in Supabase, proceed safely
      }

      // 3. Hash password with PBKDF2-SHA256 (100,000 iterations)
      const passwordHash = await hashUserPassword(password, cleanUsername);

      // 4. Create user in Supabase
      let newUser: any = null;
      let insertError: any = null;

      try {
        const res = await supabase
          .from('app_users')
          .insert([
            {
              username: cleanUsername,
              email: cleanEmail,
              password_hash: passwordHash,
            },
          ])
          .select('id, username, email')
          .single();
        newUser = res.data;
        insertError = res.error;
      } catch (err: any) {
        insertError = err;
      }

      // Fallback if email column not created yet in DB
      if (insertError && (insertError.message?.includes('column "email"') || insertError.code === '42703')) {
        const fallbackRes = await supabase
          .from('app_users')
          .insert([
            {
              username: cleanUsername,
              password_hash: passwordHash,
            },
          ])
          .select('id, username')
          .single();
        newUser = fallbackRes.data;
        insertError = fallbackRes.error;
      }

      if (insertError || !newUser) {
        console.error('Registration DB error:', insertError);
        return NextResponse.json(
          { error: 'Failed to create user account. Please run the SQL query in Supabase to create or update app_users table.' },
          { status: 500 }
        );
      }

      // 5. Issue session token (Auto-login immediately upon creation!)
      const { token } = await createUserSessionToken({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email || cleanEmail,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Account created and logged in successfully!',
        user: { id: newUser.id, username: newUser.username, email: newUser.email || cleanEmail },
      });

      // Set HTTP-Only Session Cookie
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
    // ACTION: LOGIN (Supports Username OR Gmail/Email)
    // ========================================================
    if (action === 'login') {
      let user: any = null;

      // 1. Check by username
      const { data: userByUsername } = await supabase
        .from('app_users')
        .select('id, username, email, password_hash')
        .eq('username', identifier)
        .maybeSingle();

      if (userByUsername) {
        user = userByUsername;
      } else {
        // 2. Check by email if username didn't match
        try {
          const { data: userByEmail } = await supabase
            .from('app_users')
            .select('id, username, email, password_hash')
            .eq('email', identifier)
            .maybeSingle();
          if (userByEmail) user = userByEmail;
        } catch {
          // email column might not exist yet
        }
      }

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid username/email or password.' },
          { status: 401 }
        );
      }

      // Salt uses user.username
      const isValid = await verifyUserPassword(password, user.username, user.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid username/email or password.' },
          { status: 401 }
        );
      }

      // Issue session token
      const { token } = await createUserSessionToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      const response = NextResponse.json({
        success: true,
        message: 'Logged in successfully!',
        user: { id: user.id, username: user.username, email: user.email },
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
