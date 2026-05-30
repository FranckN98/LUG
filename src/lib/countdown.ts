/**
 * Shared types & helpers for the homepage countdown widget.
 * Used by the public API, the Hero component and the admin panel.
 */

export type CountdownLocale = 'de' | 'en' | 'fr';

export type CountdownPayload = {
  isActive: boolean;
  /** ISO 8601 (UTC) string */
  targetDate: string | null;
  title: string | null;
  subtitle: string | null;
  endedMessage: string | null;
};

export type CountdownAdminPayload = {
  isActive: boolean;
  targetDate: string | null;
  titleFr: string | null;
  titleDe: string | null;
  titleEn: string | null;
  subtitleFr: string | null;
  subtitleDe: string | null;
  subtitleEn: string | null;
  endedMessageFr: string | null;
  endedMessageDe: string | null;
  endedMessageEn: string | null;
};

/** Sensible defaults shown when nothing is configured yet. */
export const DEFAULT_COUNTDOWN_COPY: Record<
  CountdownLocale,
  { title: string; subtitle: string; ended: string }
> = {
  fr: {
    title: 'Prochaine édition dans',
    subtitle: 'Level Up in Germany revient bientôt',
    ended: 'L\'événement a commencé !',
  },
  en: {
    title: 'Next edition in',
    subtitle: 'Level Up in Germany is coming back soon',
    ended: 'The event has started!',
  },
  de: {
    title: 'Nächste Ausgabe in',
    subtitle: 'Level Up in Germany kommt bald zurück',
    ended: 'Die Veranstaltung hat begonnen!',
  },
};

type LocalizedRow = Pick<
  CountdownAdminPayload,
  | 'titleFr' | 'titleDe' | 'titleEn'
  | 'subtitleFr' | 'subtitleDe' | 'subtitleEn'
  | 'endedMessageFr' | 'endedMessageDe' | 'endedMessageEn'
>;

export function pickLocalized(
  row: LocalizedRow,
  locale: CountdownLocale,
): { title: string | null; subtitle: string | null; endedMessage: string | null } {
  const suffix = locale === 'fr' ? 'Fr' : locale === 'de' ? 'De' : 'En';
  return {
    title: (row as any)[`title${suffix}`] ?? null,
    subtitle: (row as any)[`subtitle${suffix}`] ?? null,
    endedMessage: (row as any)[`endedMessage${suffix}`] ?? null,
  };
}

export type TimeLeft = {
  total: number; // ms remaining (negative if past)
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
};

export function computeTimeLeft(targetMs: number, nowMs: number = Date.now()): TimeLeft {
  const total = targetMs - nowMs;
  if (total <= 0) {
    return { total, days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / 1000 / 60 / 60) % 24);
  const days = Math.floor(total / 1000 / 60 / 60 / 24);
  return { total, days, hours, minutes, seconds, isOver: false };
}
