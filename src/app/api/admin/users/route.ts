import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    const token = match ? match[1] : null;

    const { valid } = await verifySessionToken(token);
    if (!valid) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin session missing or expired' },
        { status: 401 }
      );
    }

    const { data: users, error } = await supabaseAdmin
      .from('app_users')
      .select('id, username, email, plan, plan_expires_at, daily_request_limit, daily_requests_used, daily_reset_date, total_requests_used, last_coupon_used, is_banned, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch users error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const userList = users || [];
    const stats = {
      totalUsers: userList.length,
      freeUsers: userList.filter(u => !u.plan || u.plan === 'free').length,
      proUsers: userList.filter(u => u.plan === 'pro').length,
      premiumUsers: userList.filter(u => u.plan === 'premium').length,
      bannedUsers: userList.filter(u => !!u.is_banned).length,
    };

    return NextResponse.json({
      success: true,
      users: userList,
      stats,
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Admin users API error:', err);
    return NextResponse.json({ error: 'Server error fetching user list' }, { status: 500 });
  }
}
