import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getUserFromRequest } from '../../../../lib/userAuth';
import { getPlanLimits } from '../../../../lib/planLimits';

export async function GET(req: Request) {
  try {
    const sessionUser = await getUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json({ authenticated: false, error: 'Unauthorized' }, { status: 401 });
    }

    const planLimits = await getPlanLimits();

    // Fetch live user record from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('app_users')
      .select('id, username, email, plan, plan_expires_at, daily_request_limit, daily_requests_used, daily_reset_date, total_requests_used, last_coupon_used, is_banned, created_at')
      .eq('id', sessionUser.id)
      .maybeSingle();

    if (error || !user) {
      return NextResponse.json({ authenticated: false, error: 'User record not found' }, { status: 404 });
    }

    let plan = user.plan || 'free';
    let tierLimit = plan === 'premium' ? planLimits.premium : plan === 'pro' ? planLimits.pro : planLimits.free;
    let dailyLimit = typeof user.daily_request_limit === 'number' && user.daily_request_limit > 0 ? user.daily_request_limit : tierLimit;

    // Follow live tier minimums
    if (plan === 'free') {
      dailyLimit = planLimits.free;
    } else if (plan === 'pro') {
      dailyLimit = Math.max(dailyLimit, planLimits.pro);
    } else if (plan === 'premium') {
      dailyLimit = Math.max(dailyLimit, planLimits.premium);
    }

    let dailyUsed = typeof user.daily_requests_used === 'number' ? user.daily_requests_used : 0;
    let planExpiresAt = user.plan_expires_at;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // 1. Check if plan has expired
    let needsUpdate = false;
    const updates: Record<string, any> = {};

    if (plan !== 'free' && planExpiresAt) {
      const expiryDate = new Date(planExpiresAt);
      if (expiryDate < now) {
        plan = 'free';
        dailyLimit = planLimits.free;
        updates.plan = 'free';
        updates.daily_request_limit = planLimits.free;
        needsUpdate = true;
      }
    }

    // 2. Check if daily quota needs reset (new UTC date)
    if (user.daily_reset_date !== todayStr) {
      dailyUsed = 0;
      updates.daily_requests_used = 0;
      updates.daily_reset_date = todayStr;
      needsUpdate = true;
    }

    if (needsUpdate) {
      try {
        await supabaseAdmin
          .from('app_users')
          .update(updates)
          .eq('id', user.id);
      } catch (e) {
        console.error('Failed to sync user quota/expiry in DB:', e);
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || sessionUser.email,
        plan,
        planExpiresAt,
        dailyLimit,
        dailyUsed,
        remainingToday: Math.max(0, dailyLimit - dailyUsed),
        totalUsed: user.total_requests_used || 0,
        lastCouponUsed: user.last_coupon_used || null,
        isBanned: !!user.is_banned,
        createdAt: user.created_at,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('User profile API error:', err);
    return NextResponse.json({ error: 'Server error fetching user profile' }, { status: 500 });
  }
}
