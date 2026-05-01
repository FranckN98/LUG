import type { Locale } from '@/i18n/config';
import { prisma } from '@/lib/prisma';

export type HomeStat = { value: number; suffix: string; label: string };
export type BlogStat = { value: string; label: string };

type DefaultStat = {
  page: 'home' | 'blog';
  labelDe: string;
  labelEn: string;
  labelFr: string;
  valueNumber: number | null;
  suffix: string;
  valueText: string | null;
  displayOrder: number;
};

const DEFAULT_STATS: DefaultStat[] = [
  // Home
  {
    page: 'home',
    valueNumber: 500,
    suffix: '+',
    valueText: null,
    displayOrder: 0,
    labelDe: 'Community-Mitglieder & Teilnehmende',
    labelEn: 'Community members reached',
    labelFr: 'Membres et participant.e.s',
  },
  {
    page: 'home',
    valueNumber: 50,
    suffix: '+',
    valueText: null,
    displayOrder: 1,
    labelDe: 'Mentor:innen & Speaker:innen',
    labelEn: 'Mentors & speakers',
    labelFr: 'Mentors et intervenant.e.s',
  },
  {
    page: 'home',
    valueNumber: 15,
    suffix: '+',
    valueText: null,
    displayOrder: 2,
    labelDe: 'Partner & Universitäten',
    labelEn: 'Partners & universities',
    labelFr: 'Partenaires et universités',
  },
  // Blog
  {
    page: 'blog',
    valueNumber: 300,
    suffix: '+',
    valueText: '300+',
    displayOrder: 0,
    labelDe: 'Teilnehmer:innen 2025',
    labelEn: 'Attendees in 2025',
    labelFr: 'Participants en 2025',
  },
  {
    page: 'blog',
    valueNumber: 10,
    suffix: '+',
    valueText: '10+',
    displayOrder: 1,
    labelDe: 'Partner & Sponsoren',
    labelEn: 'Partners & Sponsors',
    labelFr: 'Partenaires & Sponsors',
  },
  {
    page: 'blog',
    valueNumber: 1,
    suffix: '',
    valueText: '1',
    displayOrder: 2,
    labelDe: 'Mega Konferenz',
    labelEn: 'Mega Conference',
    labelFr: 'Méga Conférence',
  },
];

function pickLabel(loc: Locale, row: { labelDe: string; labelEn: string; labelFr: string }): string {
  if (loc === 'fr') return row.labelFr || row.labelEn;
  if (loc === 'de') return row.labelDe || row.labelEn;
  return row.labelEn;
}

/**
 * Seeds default KPI rows for a given page if none exist. Idempotent.
 */
export async function ensureDefaultStats(page?: 'home' | 'blog'): Promise<void> {
  try {
    const pages: Array<'home' | 'blog'> = page ? [page] : ['home', 'blog'];
    for (const p of pages) {
      const count = await prisma.siteStat.count({ where: { page: p } });
      if (count === 0) {
        const defaults = DEFAULT_STATS.filter((s) => s.page === p);
        if (defaults.length > 0) {
          await prisma.siteStat.createMany({
            data: defaults.map((s) => ({
              page: s.page,
              labelDe: s.labelDe,
              labelEn: s.labelEn,
              labelFr: s.labelFr,
              valueNumber: s.valueNumber,
              suffix: s.suffix,
              valueText: s.valueText,
              displayOrder: s.displayOrder,
              isActive: true,
            })),
          });
        }
      }
    }
  } catch {
    // ignore seed errors (DB might be unavailable during build)
  }
}

export async function getHomeStats(loc: Locale): Promise<HomeStat[] | null> {
  try {
    await ensureDefaultStats('home');
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

export async function getBlogStats(loc: Locale): Promise<BlogStat[] | null> {
  try {
    await ensureDefaultStats('blog');
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
