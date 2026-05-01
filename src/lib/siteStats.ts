import type { Locale } from '@/i18n/config';
import { prisma } from '@/lib/prisma';

export type HomeStat = { value: number; suffix: string; label: string };
export type BlogStat = { value: string; label: string };

function pickLabel(loc: Locale, row: { labelDe: string; labelEn: string; labelFr: string }): string {
  if (loc === 'fr') return row.labelFr || row.labelEn;
  if (loc === 'de') return row.labelDe || row.labelEn;
  return row.labelEn;
}

/**
 * Fetch home-page KPI stats. Returns null if none configured (so the caller can
 * fall back to its hardcoded translation defaults).
 */
export async function getHomeStats(loc: Locale): Promise<HomeStat[] | null> {
  try {
    const rows = await prisma.siteStat.findMany({
      where: { page: 'home', isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (rows.length === 0) return null;
    return rows.map((r) => ({
      value: r.valueNumber ?? 0,
      suffix: r.suffix ?? '',
      label: pickLabel(loc, r),
    }));
  } catch {
    return null;
  }
}

/**
 * Fetch blog-page KPI stats. Returns null if none configured.
 */
export async function getBlogStats(loc: Locale): Promise<BlogStat[] | null> {
  try {
    const rows = await prisma.siteStat.findMany({
      where: { page: 'blog', isActive: true },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
    });
    if (rows.length === 0) return null;
    return rows.map((r) => ({
      value:
        r.valueText && r.valueText.trim()
          ? r.valueText.trim()
          : `${r.valueNumber ?? 0}${r.suffix ?? ''}`,
      label: pickLabel(loc, r),
    }));
  } catch {
    return null;
  }
}
