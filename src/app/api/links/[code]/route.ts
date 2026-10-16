import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .eq('short_code', code)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { deviceId, phoneNumber, ...updateFields } = body;

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    let query = supabase
      .from('urls')
      .update(updateFields)
      .eq('short_code', code);

    if (phoneNumber && deviceId) {
      query = query.or(`device_id.eq.${deviceId},phone_number.eq.${phoneNumber}`);
    } else if (phoneNumber) {
      query = query.eq('phone_number', phoneNumber);
    } else if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: true, data },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get('deviceId');
    const phoneNumber = searchParams.get('phoneNumber');

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    // Step 1: Find link to get ID for analytics deletion
    const { data: linkData } = await supabase
      .from('urls')
      .select('id')
      .eq('short_code', code)
      .single();

    if (linkData?.id) {
      await supabase.from('link_analytics').delete().eq('url_id', linkData.id);
    }

    // Step 2: Delete URL record
    let query = supabase.from('urls').delete().eq('short_code', code);
    if (phoneNumber && deviceId) {
      query = query.or(`device_id.eq.${deviceId},phone_number.eq.${phoneNumber}`);
    } else if (phoneNumber) {
      query = query.eq('phone_number', phoneNumber);
    } else if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    const { error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Link deleted successfully' },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
