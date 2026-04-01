import type { Locale } from '@/i18n/config';

/** Segments d\u2019URL d\u00e9di\u00e9s par \u00e9dition (sous /[locale]/events/...). */
export const EVENT_EDITION_SLUGS = {
  '2025': 'levelup2025',
  '2026': 'levelup2026',
} as const;

export type EventEditionSlug = (typeof EVENT_EDITION_SLUGS)[keyof typeof EVENT_EDITION_SLUGS];

export function eventEditionHref(locale: Locale, edition: keyof typeof EVENT_EDITION_SLUGS): string {
  return `/${locale}/events/${EVENT_EDITION_SLUGS[edition]}`;
}
