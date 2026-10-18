import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';
import { getPlanLimits, DEFAULT_PLAN_LIMITS } from '../../../lib/planLimits';

const DEFAULT_AVATAR = 'https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png';

export async function GET() {
  try {
    const limits = await getPlanLimits();
    const { data } = await supabaseAdmin
      .from('admin_settings')
      .select('display_name, brand_name, avatar_url')
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      displayName: data?.display_name || 'Muhammad Saqib',
      brandName: data?.brand_name || 'Saqib Visuals',
      avatarUrl: data?.avatar_url || DEFAULT_AVATAR,
      planLimits: limits,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    });
  } catch {
    return NextResponse.json({
      success: true,
      displayName: 'Muhammad Saqib',
      brandName: 'Saqib Visuals',
      avatarUrl: DEFAULT_AVATAR,
      planLimits: DEFAULT_PLAN_LIMITS,
    });
  }
}
