import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '../../../../../lib/auth';

async function checkAuth(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  const token = match ? match[1] : null;
  return await verifySessionToken(token);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { valid } = await checkAuth(req);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized: MrAdmin session required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('urls')
      .update(body)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { valid } = await checkAuth(req);
    if (!valid) {
      return NextResponse.json({ error: 'Unauthorized: MrAdmin session required' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    // Cascade delete analytics first
    await supabase.from('link_analytics').delete().eq('url_id', id);

    // Delete url record
    const { error } = await supabase.from('urls').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Link and analytics deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
