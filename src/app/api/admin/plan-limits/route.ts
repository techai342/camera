import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';
import { getPlanLimits, invalidatePlanLimitsCache, DEFAULT_PLAN_LIMITS } from '../../../../lib/planLimits';

async function checkAdminAuth(req: Request): Promise<boolean> {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const token = match ? match[1] : null;
  const { valid } = await verifySessionToken(token);
  return valid;
}

export async function GET(req: Request) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: MrAdmin session required' }, { status: 401 });
    }

    const limits = await getPlanLimits();

    return NextResponse.json({
      success: true,
      planLimits: limits,
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Error in GET /api/admin/plan-limits:', err);
    return NextResponse.json({ error: err?.message || 'Failed to fetch plan limits' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: MrAdmin session required' }, { status: 401 });
    }

    const body = await req.json();
    const freeDailyLimit = Math.max(1, parseInt(body.freeDailyLimit, 10) || DEFAULT_PLAN_LIMITS.free);
    const proDailyLimit = Math.max(1, parseInt(body.proDailyLimit, 10) || DEFAULT_PLAN_LIMITS.pro);
    const premiumDailyLimit = Math.max(1, parseInt(body.premiumDailyLimit, 10) || DEFAULT_PLAN_LIMITS.premium);
    const guestLimit = Math.max(1, parseInt(body.guestLimit, 10) || DEFAULT_PLAN_LIMITS.guest);
    const syncExistingUsers = !!body.syncExistingUsers;

    // Resilient DB update: Try full columns first, fallback to JSONB
    let updateSuccess = false;
    let needsSql = false;

    try {
      const { error: colErr } = await supabaseAdmin
        .from('admin_settings')
        .upsert(
          {
            id: 'primary',
            free_daily_limit: freeDailyLimit,
            pro_daily_limit: proDailyLimit,
            premium_daily_limit: premiumDailyLimit,
            guest_limit: guestLimit,
            plan_limits: {
              free: freeDailyLimit,
              pro: proDailyLimit,
              premium: premiumDailyLimit,
              guest: guestLimit,
            },
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (!colErr) {
        updateSuccess = true;
      } else {
        // Fallback: try updating plan_limits JSON column only
        const { error: jsonErr } = await supabaseAdmin
          .from('admin_settings')
          .upsert(
            {
              id: 'primary',
              plan_limits: {
                free: freeDailyLimit,
                pro: proDailyLimit,
                premium: premiumDailyLimit,
                guest: guestLimit,
              },
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

        if (!jsonErr) {
          updateSuccess = true;
        } else {
          needsSql = true;
        }
      }
    } catch {
      needsSql = true;
    }

    // Optionally sync new limits to existing user accounts
    let usersUpdatedCount = 0;
    if (syncExistingUsers) {
      try {
        // 1. Sync free users
        const { count: c1 } = await supabaseAdmin
          .from('app_users')
          .update({ daily_request_limit: freeDailyLimit })
          .or('plan.eq.free,plan.is.null');

        // 2. Sync pro users
        const { count: c2 } = await supabaseAdmin
          .from('app_users')
          .update({ daily_request_limit: proDailyLimit })
          .eq('plan', 'pro');

        // 3. Sync premium users
        const { count: c3 } = await supabaseAdmin
          .from('app_users')
          .update({ daily_request_limit: premiumDailyLimit })
          .eq('plan', 'premium');

        usersUpdatedCount = (c1 || 0) + (c2 || 0) + (c3 || 0);
      } catch (err) {
        console.warn('Could not batch sync users limit:', err);
      }
    }

    // Invalidate local memory cache immediately
    invalidatePlanLimitsCache();

    return NextResponse.json({
      success: true,
      message: 'Subscription plan limits updated successfully!',
      needsSql,
      planLimits: {
        free: freeDailyLimit,
        pro: proDailyLimit,
        premium: premiumDailyLimit,
        guest: guestLimit,
      },
      usersUpdatedCount,
    });
  } catch (err: any) {
    console.error('Error in PUT /api/admin/plan-limits:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update plan limits' }, { status: 500 });
  }
}
