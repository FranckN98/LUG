import type { Locale } from '@/i18n/config';
import { prisma } from '@/lib/prisma';
import { resolveConfigLocale, resolvePassLocale } from '@/lib/ticketingI18n';
import { getBlogStats } from '@/lib/siteStats';
import { FALLBACK_EDITION_YEAR, isTicketSaleOpen, lastHeldEdition, type EditionTiming } from '@/lib/ticketSaleWindow';

export type HomeNextEdition = {
  /** Dernière édition déjà tenue (cible de « Revivre la dernière édition »). */
  lastEdition: '2025' | '2026';
} & (
  | { state: 'notify' }
  | {
      state: 'open';
      dateLabel: string | null;
      locationLabel: string | null;
      /** Chemin relatif à la locale, ex. « /events#2026-programme ». */
      programmeHref: string | null;
      ticketNames: string[];
      priceFrom: string | null;
    }
);

export type HomeProofStat = { value: string; label: string };

const INTL_LOCALE: Record<Locale, string> = { fr: 'fr-FR', de: 'de-DE', en: 'en-GB' };

function parseList(raw: string | null | undefined): string[] {
  try {
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function formatPrice(cents: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(INTL_LOCALE[locale], {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/**
 * Les détails ne sont présentés comme confirmés que si la billetterie est activée dans l'admin
 * et que l'édition concernée n'est pas terminée ; sinon la page propose l'inscription d'information.
 */
export async function getHomeNextEdition(locale: Locale, now: Date = new Date()): Promise<HomeNextEdition> {
  let event: (EditionTiming & { showProgramme: boolean; scheduleCount: number }) | null = null;
  try {
    const [config, row] = await Promise.all([
      prisma.ticketingConfig.findUnique({
        where: { id: 'singleton' },
        include: { passes: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      }),
      prisma.event.findFirst({
        where: { deletedAt: null, status: { in: ['published', 'upcoming', 'finished'] } },
        orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }],
        select: {
          year: true,
          status: true,
          startsAt: true,
          endsAt: true,
          showProgramme: true,
          _count: { select: { scheduleItems: true } },
        },
      }),
    ]);

    event = row
      ? {
          year: row.year,
          status: row.status,
          startsAt: row.startsAt,
          endsAt: row.endsAt,
          showProgramme: row.showProgramme,
          scheduleCount: row._count.scheduleItems,
        }
      : null;
    const lastEdition = lastHeldEdition(event, now);

    if (!config || !isTicketSaleOpen({ ticketingActive: config.isNewTicketingActive, event, now })) {
      return { state: 'notify', lastEdition };
    }

    const localized = resolveConfigLocale(
      {
        pageTitle: config.pageTitle,
        pageSubtitle: config.pageSubtitle,
        pageIntro: config.pageIntro,
        eventDate: config.eventDate,
        eventLocation: config.eventLocation,
        ctaButtonText: config.ctaButtonText,
      },
      config.translations,
      locale,
    );

    const passes = config.passes.map((pass) => ({
      pass,
      localized: resolvePassLocale(
        {
          name: pass.name,
          label: pass.label,
          targetAudience: pass.targetAudience,
          description: pass.description,
          highlights: parseList(pass.highlights),
          includes: parseList(pass.includes),
          decisionPhrase: pass.decisionPhrase,
          availabilityNote: pass.availabilityNote ?? '',
        },
        pass.translations,
        locale,
      ),
    }));

    const priced = passes
      .filter(({ pass }) => pass.status === 'available' && pass.priceCents > 0)
      .sort((a, b) => a.pass.priceCents - b.pass.priceCents)[0];

    const year = event?.year ?? FALLBACK_EDITION_YEAR;
    const hasProgramme = event?.showProgramme !== false && (year === 2026 || (event?.scheduleCount ?? 0) > 0);

    return {
      state: 'open',
      lastEdition,
      dateLabel: localized.eventDate.trim() || null,
      locationLabel: localized.eventLocation.trim() || null,
      programmeHref: hasProgramme ? (year === 2026 ? '/events#2026-programme' : '/events') : null,
      ticketNames: passes.map(({ localized: l }) => l.name.trim()).filter(Boolean),
      priceFrom: priced ? formatPrice(priced.pass.priceCents, priced.pass.currency, locale) : null,
    };
  } catch {
    return { state: 'notify', lastEdition: lastHeldEdition(event, now) };
  }
}

/** Seuls les chiffres déjà publiés et datés (ex. « Participants en 2025 ») sont repris ; les autres sont omis. */
export async function getHomeProofStats(locale: Locale): Promise<HomeProofStat[]> {
  const stats = await getBlogStats(locale);
  return (stats ?? []).filter((s) => /\b20\d{2}\b/.test(s.label) && s.value.trim() !== '' && s.value.trim() !== '0');
}
