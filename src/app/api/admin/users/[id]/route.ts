import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../../lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '../../../../../lib/auth';

async function checkAdminAuth(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const token = match ? match[1] : null;
  const { valid } = await verifySessionToken(token);
  return valid;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, any> = {};

    if (typeof body.is_banned === 'boolean') {
      updates.is_banned = body.is_banned;
    }
    if (typeof body.plan === 'string') {
      updates.plan = body.plan;
    }
    if (body.plan_expires_at !== undefined) {
      updates.plan_expires_at = body.plan_expires_at;
    }
    if (typeof body.daily_request_limit === 'number') {
      updates.daily_request_limit = body.daily_request_limit;
    }
    if (body.reset_daily_quota) {
      updates.daily_requests_used = 0;
    }

    const { data, error } = await supabaseAdmin
      .from('app_users')
      .update(updates)
      .eq('id', id)
      .select('id, username, email, plan, plan_expires_at, daily_request_limit, daily_requests_used, is_banned')
      .single();

    if (error) {
      console.error('Update user error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    console.error('Admin update user error:', err);
    return NextResponse.json({ error: 'Server error updating user' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { id } = await params;

    // Delete redemptions first if foreign key cascade not set
    try {
      await supabaseAdmin
        .from('coupon_redemptions')
        .delete()
        .eq('user_id', id);
    } catch {}

    const { error } = await supabaseAdmin
      .from('app_users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete user error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Admin delete user error:', err);
    return NextResponse.json({ error: 'Server error deleting user' }, { status: 500 });
  }
}
