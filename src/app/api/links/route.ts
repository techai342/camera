import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

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
    const deviceId = searchParams.get('deviceId');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!deviceId && !phoneNumber) {
      return NextResponse.json(
        { error: 'deviceId or phoneNumber is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    let query = supabaseAdmin
      .from('urls')
      .select('id, domain, short_code, long_url, password, social_gate_title, social_gate_url, created_at, expires_at, capture_camera, capture_location')
      .order('created_at', { ascending: false })
      .limit(50);

    if (deviceId && phoneNumber) {
      query = query.or(`device_id.eq.${deviceId},phone_number.eq.${phoneNumber}`);
    } else if (phoneNumber) {
      query = query.eq('phone_number', phoneNumber);
    } else if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Fetch links error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: true, links: data || [] },
      { 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'private, max-age=10, stale-while-revalidate=30',
        } 
      }
    );
  } catch (err: any) {
    console.error('Links API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
