import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const RANGES: Record<string, number> = {
  '24h': 1,
  '7d': 7,
  '30d': 30,
  '90d': 90,
};

const SOCIAL_SOURCES = ['tiktok', 'instagram', 'linkedin', 'facebook', 'twitter', 'youtube', 'whatsapp'];

type AnalyticsRow = {
  name: string;
  page: string | null;
  source: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  visitorHash: string | null;
  sessionId: string | null;
  country: string | null;
  device: string | null;
  locale: string | null;
  createdAt: Date;
};

function dailySeries(rows: AnalyticsRow[], days: number) {
  const dayMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (const row of rows) {
    if (row.name !== 'page_view') continue;
    const day = row.createdAt.toISOString().slice(0, 10);
    const entry = dayMap.get(day) ?? { views: 0, visitors: new Set<string>() };
    entry.views += 1;
    if (row.visitorHash) entry.visitors.add(row.visitorHash);
    dayMap.set(day, entry);
  }

  const firstDay = new Date();
  firstDay.setUTCHours(0, 0, 0, 0);
  firstDay.setUTCDate(firstDay.getUTCDate() - (days - 1));
  const daily: Array<{ day: string; views: number; visitors: number }> = [];
  for (let day = new Date(firstDay); day <= new Date(); day.setUTCDate(day.getUTCDate() + 1)) {
    const key = day.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    daily.push({ day: key, views: entry?.views ?? 0, visitors: entry?.visitors.size ?? 0 });
  }
  return daily;
}

function monthlySeries(rows: AnalyticsRow[]) {
  const monthMap = new Map<string, { views: number; visitors: Set<string> }>();
  for (const row of rows) {
    if (row.name !== 'page_view') continue;
    const month = row.createdAt.toISOString().slice(0, 7);
    const entry = monthMap.get(month) ?? { views: 0, visitors: new Set<string>() };
    entry.views += 1;
    if (row.visitorHash) entry.visitors.add(row.visitorHash);
    monthMap.set(month, entry);
  }

  const currentMonth = new Date();
  currentMonth.setUTCDate(1);
  currentMonth.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(currentMonth);
    date.setUTCMonth(date.getUTCMonth() - (2 - index));
    const month = date.toISOString().slice(0, 7);
    const entry = monthMap.get(month);
    return { month, views: entry?.views ?? 0, visitors: entry?.visitors.size ?? 0 };
  });
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(req.url);
    const rangeKey = searchParams.get('range') || '7d';
    const days = RANGES[rangeKey] ?? 7;
    const sourceFilter = searchParams.get('source')?.trim().toLowerCase() || null;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

    // Pull all rows in window — for analytics scale this is fine. We aggregate in JS to
    // avoid SQLite/Postgres dialect differences and Date binding issues.
    const allRows = await prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: ninetyDaysAgo } },
      select: {
        name: true,
        page: true,
        source: true,
        utmSource: true,
        utmCampaign: true,
        visitorHash: true,
        sessionId: true,
        country: true,
        device: true,
        locale: true,
        createdAt: true,
      },
    });
    const rows = allRows.filter((row) => row.createdAt >= since && (!sourceFilter || row.source?.toLowerCase() === sourceFilter));

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

    const filteredNinetyDayRows = sourceFilter
      ? allRows.filter((row) => row.source?.toLowerCase() === sourceFilter)
      : allRows;
    const audience = {
      sessions: new Set(rows.map((row) => row.sessionId).filter((value): value is string => Boolean(value))).size,
      devices: tally(rows.filter((row) => row.name === 'page_view').map((row) => row.device ?? 'unknown')).map(([label, value]) => ({ label, value })),
      countries: tally(rows.filter((row) => row.name === 'page_view').map((row) => row.country ?? 'unknown')).map(([label, value]) => ({ label, value })),
      languages: tally(rows.filter((row) => row.name === 'page_view').map((row) => row.locale ?? 'unknown')).map(([label, value]) => ({ label, value })),
    };
    const socialSources = SOCIAL_SOURCES.map((source) => ({
      source,
      count: allRows.filter((row) => row.name === 'page_view' && row.source?.toLowerCase() === source).length,
    }));

    return NextResponse.json({
      ok: true,
      range: rangeKey,
      totals: { events: totalEvents, pageViews, uniqueVisitors },
      topPages,
      topSources,
      topCampaigns,
      eventBreakdown,
      daily: dailySeries(rows, days),
      last7Days: dailySeries(filteredNinetyDayRows, 7),
      last3Months: monthlySeries(filteredNinetyDayRows),
      socialSources,
      audience,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[admin/analytics]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
