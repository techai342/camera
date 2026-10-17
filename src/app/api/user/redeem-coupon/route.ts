import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase';
import { getUserFromRequest } from '../../../../lib/userAuth';

export async function POST(req: Request) {
  try {
    const sessionUser = await getUserFromRequest(req);
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'Please log in to your account to redeem coupon codes.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawCode = (body.code || '').trim();

    if (!rawCode) {
      return NextResponse.json(
        { error: 'Please enter a coupon code.' },
        { status: 400 }
      );
    }

    const code = rawCode.toUpperCase();

    // 1. Fetch coupon details
    const { data: coupon, error: couponErr } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .ilike('code', code)
      .maybeSingle();

    if (couponErr || !coupon) {
      return NextResponse.json(
        { error: `Coupon code "${code}" is invalid or does not exist.` },
        { status: 404 }
      );
    }

    // 2. Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json(
        { error: 'This coupon code has been temporarily deactivated.' },
        { status: 400 }
      );
    }

    // 3. Check if coupon itself has expired
    if (coupon.expires_at) {
      const couponExpiry = new Date(coupon.expires_at);
      if (couponExpiry < new Date()) {
        return NextResponse.json(
          { error: `This coupon code expired on ${couponExpiry.toLocaleDateString()}.` },
          { status: 400 }
        );
      }
    }

    // 4. Check account redemption cap
    if (coupon.max_uses > 0 && (coupon.times_used || 0) >= coupon.max_uses) {
      return NextResponse.json(
        { error: 'This coupon has reached its maximum account redemption limit.' },
        { status: 400 }
      );
    }

    // 5. Check if this specific user has already redeemed this coupon
    try {
      const { data: existingRedemption } = await supabaseAdmin
        .from('coupon_redemptions')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', sessionUser.id)
        .maybeSingle();

      if (existingRedemption) {
        return NextResponse.json(
          { error: 'You have already redeemed this coupon code on this account.' },
          { status: 400 }
        );
      }
    } catch {
      // Table may not have unique constraint yet, continue gracefully
    }

    // 6. Fetch current user plan state
    const { data: currentUser } = await supabaseAdmin
      .from('app_users')
      .select('id, plan, plan_expires_at, is_banned')
      .eq('id', sessionUser.id)
      .single();

    if (currentUser?.is_banned) {
      return NextResponse.json(
        { error: 'This account is suspended and cannot redeem coupons.' },
        { status: 403 }
      );
    }

    // 7. Calculate new expiration date
    const durationDays = Number(coupon.duration_days) || 30;
    const now = Date.now();
    let newExpiresAt: string | null = null;

    if (durationDays >= 9999) {
      // Lifetime plan
      newExpiresAt = null;
    } else {
      let baseTime = now;
      // If user is already on this tier and their plan hasn't expired yet, extend it!
      if (
        currentUser?.plan === coupon.plan_tier &&
        currentUser?.plan_expires_at &&
        new Date(currentUser.plan_expires_at).getTime() > now
      ) {
        baseTime = new Date(currentUser.plan_expires_at).getTime();
      }
      newExpiresAt = new Date(baseTime + durationDays * 86400000).toISOString();
    }

    const dailyLimit = Number(coupon.daily_limit) || (coupon.plan_tier === 'premium' ? 99999 : 50);

    // 8. Atomically upgrade user record
    const { error: userUpdateErr } = await supabaseAdmin
      .from('app_users')
      .update({
        plan: coupon.plan_tier,
        plan_expires_at: newExpiresAt,
        daily_request_limit: dailyLimit,
        last_coupon_used: coupon.code,
      })
      .eq('id', sessionUser.id);

    if (userUpdateErr) {
      console.error('Failed to update user plan on redemption:', userUpdateErr);
      return NextResponse.json(
        { error: 'Failed to apply plan upgrade. Please try again or contact admin.' },
        { status: 500 }
      );
    }

    // 9. Increment coupon times_used
    try {
      await supabaseAdmin
        .from('coupons')
        .update({
          times_used: (coupon.times_used || 0) + 1,
        })
        .eq('id', coupon.id);
    } catch (e) {
      console.error('Failed to increment coupon times_used:', e);
    }

    // 10. Record redemption history
    try {
      await supabaseAdmin
        .from('coupon_redemptions')
        .insert([
          {
            coupon_id: coupon.id,
            coupon_code: coupon.code,
            user_id: sessionUser.id,
            user_email: sessionUser.email || '',
            redeemed_at: new Date().toISOString(),
          },
        ]);
    } catch (e) {
      console.error('Failed to insert redemption log:', e);
    }

    const tierTitle = coupon.plan_tier === 'premium' ? 'PREMIUM VIP' : 'PRO';

    return NextResponse.json({
      success: true,
      message: `🎉 Success! Your account has been upgraded to the ${tierTitle} Plan.`,
      plan: coupon.plan_tier,
      planExpiresAt: newExpiresAt,
      dailyLimit,
      couponCode: coupon.code,
    });
  } catch (err: any) {
    console.error('Redeem coupon API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Server error processing coupon redemption.' },
      { status: 500 }
    );
  }
}
