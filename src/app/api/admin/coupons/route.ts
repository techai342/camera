import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

async function checkAdminAuth(req: Request) {
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
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const { data: coupons, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch coupons error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const list = coupons || [];
    const stats = {
      totalCoupons: list.length,
      activeCoupons: list.filter(c => !!c.is_active).length,
      totalRedemptions: list.reduce((acc, c) => acc + (c.times_used || 0), 0),
    };

    return NextResponse.json({
      success: true,
      coupons: list,
      stats,
    }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    console.error('Admin coupons API error:', err);
    return NextResponse.json({ error: 'Server error fetching coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await checkAdminAuth(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }

    const body = await req.json();
    const rawCode = (body.code || '').trim();

    if (!rawCode) {
      return NextResponse.json({ error: 'Coupon code string is required' }, { status: 400 });
    }

    const code = rawCode.toUpperCase();
    const planTier = body.plan_tier === 'premium' ? 'premium' : 'pro';
    const durationDays = Number(body.duration_days) || 30;
    const dailyLimit = Number(body.daily_limit) || (planTier === 'premium' ? 99999 : 50);
    const maxUses = typeof body.max_uses === 'number' ? body.max_uses : 50;
    const expiresAt = body.expires_at ? new Date(body.expires_at).toISOString() : null;

    // Check if duplicate code exists
    const { data: existing } = await supabaseAdmin
      .from('coupons')
      .select('id')
      .eq('code', code)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${code}" already exists. Please choose another.` },
        { status: 409 }
      );
    }

    // Resilient insert supporting either plan_tier or plan column name
    let newCoupon: any = null;
    let insertErr: any = null;

    // 1. Try with both plan_tier and plan
    const resBoth = await supabaseAdmin
      .from('coupons')
      .insert([
        {
          code,
          plan_tier: planTier,
          plan: planTier,
          duration_days: durationDays,
          daily_limit: dailyLimit,
          max_uses: maxUses,
          times_used: 0,
          expires_at: expiresAt,
          is_active: true,
        },
      ])
      .select('*')
      .single();

    if (!resBoth.error) {
      newCoupon = resBoth.data;
    } else {
      // 2. Fallback: try with plan_tier only
      const resTier = await supabaseAdmin
        .from('coupons')
        .insert([
          {
            code,
            plan_tier: planTier,
            duration_days: durationDays,
            daily_limit: dailyLimit,
            max_uses: maxUses,
            times_used: 0,
            expires_at: expiresAt,
            is_active: true,
          },
        ])
        .select('*')
        .single();

      if (!resTier.error) {
        newCoupon = resTier.data;
      } else {
        // 3. Fallback: try with plan only
        const resPlan = await supabaseAdmin
          .from('coupons')
          .insert([
            {
              code,
              plan: planTier,
              duration_days: durationDays,
              daily_limit: dailyLimit,
              max_uses: maxUses,
              times_used: 0,
              expires_at: expiresAt,
              is_active: true,
            },
          ])
          .select('*')
          .single();

        if (!resPlan.error) {
          newCoupon = resPlan.data;
        } else {
          insertErr = resPlan.error || resTier.error || resBoth.error;
        }
      }
    }

    if (insertErr) {
      console.error('Create coupon error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Coupon code "${code}" created successfully!`,
      coupon: newCoupon,
    });
  } catch (err: any) {
    console.error('Create coupon API error:', err);
    return NextResponse.json({ error: 'Server error creating coupon' }, { status: 500 });
  }
}
