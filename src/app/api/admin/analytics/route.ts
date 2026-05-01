import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const RANGES: Record<string, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rangeKey = searchParams.get('range') || '7d';
    const days = RANGES[rangeKey] ?? 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalEvents,
      pageViews,
      uniqueVisitorsRows,
      topPagesRows,
      topSourcesRows,
      topCampaignsRows,
      eventBreakdownRows,
      dailyRows,
    ] = await Promise.all([
      prisma.analyticsEvent.count({ where: { createdAt: { gte: since } } }),
      prisma.analyticsEvent.count({ where: { createdAt: { gte: since }, name: 'page_view' } }),
      prisma.$queryRawUnsafe<Array<{ visitors: bigint }>>(
        `SELECT COUNT(DISTINCT visitor_hash) AS visitors FROM analytics_events WHERE created_at >= ?`,
        since.toISOString(),
      ),
      prisma.$queryRawUnsafe<Array<{ page: string; views: bigint }>>(
        `SELECT page, COUNT(*) AS views FROM analytics_events WHERE created_at >= ? AND name = 'page_view' AND page IS NOT NULL GROUP BY page ORDER BY views DESC LIMIT 10`,
        since.toISOString(),
      ),
      prisma.$queryRawUnsafe<Array<{ source: string; count: bigint }>>(
        `SELECT COALESCE(source, 'direct') AS source, COUNT(*) AS count FROM analytics_events WHERE created_at >= ? AND name = 'page_view' GROUP BY source ORDER BY count DESC LIMIT 10`,
        since.toISOString(),
      ),
      prisma.$queryRawUnsafe<Array<{ utm_source: string | null; utm_campaign: string | null; count: bigint }>>(
        `SELECT utm_source, utm_campaign, COUNT(*) AS count FROM analytics_events WHERE created_at >= ? AND utm_campaign IS NOT NULL GROUP BY utm_source, utm_campaign ORDER BY count DESC LIMIT 10`,
        since.toISOString(),
      ),
      prisma.$queryRawUnsafe<Array<{ name: string; count: bigint }>>(
        `SELECT name, COUNT(*) AS count FROM analytics_events WHERE created_at >= ? AND name <> 'page_view' GROUP BY name ORDER BY count DESC`,
        since.toISOString(),
      ),
      prisma.$queryRawUnsafe<Array<{ day: string; views: bigint; visitors: bigint }>>(
        `SELECT substr(created_at, 1, 10) AS day, COUNT(*) AS views, COUNT(DISTINCT visitor_hash) AS visitors FROM analytics_events WHERE created_at >= ? AND name = 'page_view' GROUP BY day ORDER BY day ASC`,
        since.toISOString(),
      ),
    ]);

    const num = (v: bigint | number) => (typeof v === 'bigint' ? Number(v) : v);

    return NextResponse.json({
      ok: true,
      range: rangeKey,
      totals: {
        events: totalEvents,
        pageViews,
        uniqueVisitors: num(uniqueVisitorsRows[0]?.visitors ?? 0),
      },
      topPages: topPagesRows.map((r) => ({ page: r.page, views: num(r.views) })),
      topSources: topSourcesRows.map((r) => ({ source: r.source, count: num(r.count) })),
      topCampaigns: topCampaignsRows.map((r) => ({
        utm_source: r.utm_source,
        utm_campaign: r.utm_campaign,
        count: num(r.count),
      })),
      eventBreakdown: eventBreakdownRows.map((r) => ({ name: r.name, count: num(r.count) })),
      daily: dailyRows.map((r) => ({
        day: r.day,
        views: num(r.views),
        visitors: num(r.visitors),
      })),
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[admin/analytics]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
