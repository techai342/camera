import { NextResponse } from 'next/server';
import { supabase } from '../../../../../lib/supabase';
import { timingSafeEqualStr } from '../../../../../lib/auth';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    const body = await req.json();
    const { password } = body;

    if (!shortCode) {
      return NextResponse.json({ error: 'Short code is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('urls')
      .select('id, password, long_url, expires_at')
      .eq('short_code', shortCode)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This link has expired' }, { status: 410 });
    }

    // Verify password using constant-time comparison
    const isMatch = timingSafeEqualStr(String(password), String(data.password || ''));
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      long_url: data.long_url,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Verification failed' }, { status: 500 });
  }
}
