export type EditionTiming = {
  year: number;
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
};

/** Fin connue d'une édition quand la base n'a pas de date exploitable (samedi 17 octobre 2026, clôture à 18h30, heure de Berlin). */
const KNOWN_EDITION_END: Record<number, string> = { 2026: '2026-10-17T18:30:00+02:00' };

/** Édition à laquelle la billetterie actuelle se rapporte quand aucun événement n'est publié en base. */
export const FALLBACK_EDITION_YEAR = 2026;

const HOURS_12 = 12 * 60 * 60 * 1000;

export function editionEnd(event: EditionTiming | null): Date | null {
  if (event?.endsAt) return event.endsAt;
  if (event?.startsAt) return new Date(event.startsAt.getTime() + HOURS_12);
  const iso = KNOWN_EDITION_END[event?.year ?? FALLBACK_EDITION_YEAR];
  return iso ? new Date(iso) : null;
}

export function hasEditionPassed(event: EditionTiming | null, now: Date): boolean {
  if (event?.status === 'finished') return true;
  const end = editionEnd(event);
  return end ? now.getTime() >= end.getTime() : false;
}

/** La billetterie n'est « ouverte » que si l'admin l'a activée ET que l'édition concernée n'est pas terminée. */
export function isTicketSaleOpen(input: { ticketingActive: boolean; event: EditionTiming | null; now: Date }): boolean {
  return input.ticketingActive && !hasEditionPassed(input.event, input.now);
}

/** Dernière édition déjà tenue parmi celles qui ont une page dédiée (2025 ou 2026). */
export function lastHeldEdition(event: EditionTiming | null, now: Date): '2025' | '2026' {
  const current = event ?? { year: FALLBACK_EDITION_YEAR, status: 'published', startsAt: null, endsAt: null };
  if (current.year <= 2025) return '2025';
  if (current.year >= 2027) return '2026';
  return hasEditionPassed(current, now) ? '2026' : '2025';
}
