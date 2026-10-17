import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { verifySessionToken, getAdminSettings, hashPasswordPBKDF2, createSessionToken, COOKIE_NAME } from '../../../../lib/auth';

const DEFAULT_SALT = process.env.ADMIN_SALT || 'mradmin_super_secure_salt_99';
const DEFAULT_AVATAR = 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png';

async function checkAuth(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const token = match ? match[1] : null;
  return await verifySessionToken(token);
}

export async function GET(req: Request) {
  try {
    const { valid } = await checkAuth(req);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized: MrAdmin session required' }, { status: 401 });
    }

    const settings = await getAdminSettings();

    return NextResponse.json({
      success: true,
      profile: {
        username: settings?.username || process.env.ADMIN_USERNAME || 'admin',
        displayName: settings?.display_name || 'Muhammad Saqib',
        brandName: settings?.brand_name || 'Saqib Visuals',
        avatarUrl: settings?.avatar_url || DEFAULT_AVATAR,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to fetch admin profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { valid, user } = await checkAuth(req);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized: MrAdmin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { username, password, displayName, brandName, avatarUrl } = body;

    const currentSettings = await getAdminSettings();

    const updatePayload: Record<string, any> = {
      id: 'primary',
      username: username?.trim() || currentSettings?.username || 'admin',
      display_name: displayName?.trim() || currentSettings?.display_name || 'Muhammad Saqib',
      brand_name: brandName?.trim() || currentSettings?.brand_name || 'Saqib Visuals',
      avatar_url: avatarUrl?.trim() || currentSettings?.avatar_url || DEFAULT_AVATAR,
      updated_at: new Date().toISOString(),
    };

    if (password && typeof password === 'string' && password.trim().length > 0) {
      updatePayload.password_hash = await hashPasswordPBKDF2(password.trim(), DEFAULT_SALT);
      updatePayload.salt = DEFAULT_SALT;
    } else if (currentSettings?.password_hash) {
      updatePayload.password_hash = currentSettings.password_hash;
      updatePayload.salt = currentSettings.salt || DEFAULT_SALT;
    }

    const { data, error } = await supabaseAdmin
      .from('admin_settings')
      .upsert(updatePayload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { 
          error: `Database update failed: ${error.message}. Make sure to execute the SQL query in Supabase SQL editor.`,
          needsSql: true,
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Admin profile updated successfully in Supabase!',
      profile: {
        username: data.username,
        displayName: data.display_name,
        brandName: data.brand_name,
        avatarUrl: data.avatar_url,
      },
    });

    // If username changed, renew cookie session
    if (username && username.trim() !== user) {
      const { token, expiresAt } = await createSessionToken(username.trim());
      const isProduction = process.env.NODE_ENV === 'production';
      response.cookies.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        path: '/',
        expires: new Date(expiresAt),
        maxAge: 60 * 60 * 24,
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Profile update failed' }, { status: 500 });
  }
}
