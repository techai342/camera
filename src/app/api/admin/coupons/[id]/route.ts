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

    if (typeof body.is_active === 'boolean') {
      updates.is_active = body.is_active;
    }
    if (typeof body.max_uses === 'number') {
      updates.max_uses = body.max_uses;
    }
    if (body.expires_at !== undefined) {
      updates.expires_at = body.expires_at ? new Date(body.expires_at).toISOString() : null;
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Update coupon error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, coupon: data });
  } catch (err: any) {
    console.error('Admin update coupon error:', err);
    return NextResponse.json({ error: 'Server error updating coupon' }, { status: 500 });
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

    // Delete associated redemptions first
    try {
      await supabaseAdmin
        .from('coupon_redemptions')
        .delete()
        .eq('coupon_id', id);
    } catch {}

    const { error } = await supabaseAdmin
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete coupon error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (err: any) {
    console.error('Admin delete coupon error:', err);
    return NextResponse.json({ error: 'Server error deleting coupon' }, { status: 500 });
  }
}
