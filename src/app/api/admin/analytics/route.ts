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

    // Pull all rows in window — for analytics scale this is fine. We aggregate in JS to
    // avoid SQLite/Postgres dialect differences and Date binding issues.
    const rows = await prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since } },
      select: {
        name: true,
        page: true,
        source: true,
        utmSource: true,
        utmCampaign: true,
        visitorHash: true,
        createdAt: true,
      },
    });

    const totalEvents = rows.length;
    const pageViews = rows.filter((r) => r.name === 'page_view').length;
    const uniqueVisitors = new Set(
      rows.map((r) => r.visitorHash).filter((v): v is string => Boolean(v)),
    ).size;

    const tally = (items: Array<string | null | undefined>) => {
      const map = new Map<string, number>();
      for (const it of items) {
        if (!it) continue;
        map.set(it, (map.get(it) ?? 0) + 1);
      }
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    };

    const topPages = tally(rows.filter((r) => r.name === 'page_view').map((r) => r.page)).map(
      ([page, views]) => ({ page, views }),
    );

    const topSources = tally(
      rows.filter((r) => r.name === 'page_view').map((r) => r.source ?? 'direct'),
    ).map(([source, count]) => ({ source, count }));

    const campaignMap = new Map<
      string,
      { utm_source: string | null; utm_campaign: string | null; count: number }
    >();
    for (const r of rows) {
      if (!r.utmCampaign) continue;
      const key = `${r.utmSource ?? ''}::${r.utmCampaign}`;
      const cur = campaignMap.get(key);
      if (cur) cur.count += 1;
      else
        campaignMap.set(key, {
          utm_source: r.utmSource ?? null,
          utm_campaign: r.utmCampaign,
          count: 1,
        });
    }
    const topCampaigns = Array.from(campaignMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const eventBreakdown = tally(
      rows.filter((r) => r.name !== 'page_view').map((r) => r.name),
    ).map(([name, count]) => ({ name, count }));

    // Daily series — fill every day in window so the chart isn't sparse.
    const dayMap = new Map<string, { views: number; visitors: Set<string> }>();
    for (const r of rows) {
      if (r.name !== 'page_view') continue;
      const day = r.createdAt.toISOString().slice(0, 10);
      let entry = dayMap.get(day);
      if (!entry) {
        entry = { views: 0, visitors: new Set() };
        dayMap.set(day, entry);
      }
      entry.views += 1;
      if (r.visitorHash) entry.visitors.add(r.visitorHash);
    }
    const daily: Array<{ day: string; views: number; visitors: number }> = [];
    const startDay = new Date(since);
    startDay.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    for (let d = new Date(startDay); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      const entry = dayMap.get(key);
      daily.push({ day: key, views: entry?.views ?? 0, visitors: entry?.visitors.size ?? 0 });
    }

    return NextResponse.json({
      ok: true,
      range: rangeKey,
      totals: { events: totalEvents, pageViews, uniqueVisitors },
      topPages,
      topSources,
      topCampaigns,
      eventBreakdown,
      daily,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[admin/analytics]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
