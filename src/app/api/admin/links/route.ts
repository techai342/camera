import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { verifySessionToken, COOKIE_NAME } from '../../../../lib/auth';

export async function GET(req: Request) {
  try {
    // 1. Enforce Server-Side MrAdmin Session Check
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
    const token = match ? match[1] : null;

    const { valid } = await verifySessionToken(token);
    if (!valid) {
      return NextResponse.json(
        { error: 'Unauthorized: MrAdmin access token missing or invalid' },
        { status: 401 }
      );
    }

    // 2. Fetch Data
    const { data, error } = await supabase
      .from('urls')
      .select(`
        *,
        link_analytics (
          id,
          captured_image,
          location_name,
          latitude
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Fetch Global Total Clicks
    const { count: globalClicksCount } = await supabase
      .from('link_analytics')
      .select('*', { count: 'exact', head: true });

    // Fetch Unique Visitors
    const { data: visitorData } = await supabase
      .from('link_analytics')
      .select('ip_address');

    const uniqueVisitors = visitorData
      ? new Set(visitorData.map((v: any) => v.ip_address).filter(Boolean)).size
      : 0;
    const uniqueAdmins = new Set((data || []).map((l: any) => l.device_id)).size;

    const processedLinks = (data || []).map((link: any) => {
      const analytics = link.link_analytics || [];
      return {
        ...link,
        clicks: analytics.length,
        image_count: analytics.filter((a: any) => a.captured_image).length,
        location_count: analytics.filter((a: any) => a.location_name).length,
        geo_count: analytics.filter((a: any) => a.latitude).length,
      };
    }).sort((a: any, b: any) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const sumClicks = processedLinks.reduce((acc: number, curr: any) => acc + (curr.clicks || 0), 0);

    return NextResponse.json(
      {
        success: true,
        links: processedLinks,
        stats: {
          totalLinks: processedLinks.length,
          totalClicks: globalClicksCount || sumClicks,
          totalAdmins: uniqueAdmins,
          totalVisitors: uniqueVisitors || 0,
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
