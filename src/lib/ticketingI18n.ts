import type { Locale } from '@/i18n/config';
import { translateFrenchDate, translateKnownPhrase } from '@/lib/ticketingGlossary';

// The base TicketingConfig/TicketingPass columns are authored in French (the
// site's default authoring language). `translations` stores optional EN/DE
// overrides as a JSON string: `Partial<Record<'en' | 'de', Partial<Fields>>>`.
// Locale resolution: fr -> base columns; en/de -> translations[locale] when non-empty,
// otherwise the built-in glossary (src/lib/ticketingGlossary.ts) for known French
// phrases, otherwise the French base text.

export type TicketingConfigTranslatable = {
  pageTitle: string;
  pageSubtitle: string;
  pageIntro: string;
  eventDate: string;
  eventLocation: string;
  ctaButtonText: string;
};

export type TicketingPassTranslatable = {
  name: string;
  label: string;
  targetAudience: string;
  description: string;
  highlights: string[];
  includes: string[];
  decisionPhrase: string;
  availabilityNote: string;
};

export type TicketingTranslatableLocale = Exclude<Locale, 'fr'>;

export function parseTranslationsJson<T extends Record<string, unknown>>(raw: string | null | undefined): Partial<Record<TicketingTranslatableLocale, Partial<T>>> {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function stringifyTranslationsJson<T extends Record<string, unknown>>(value: Partial<Record<TicketingTranslatableLocale, Partial<T>>> | null | undefined): string {
  if (!value || typeof value !== 'object') return '{}';
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
}

function nonEmpty(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function pickText(override: string | undefined | null, base: string, locale: Locale): string {
  if (nonEmpty(override)) return override;
  return translateKnownPhrase(base, locale) ?? base;
}

function pickList(override: string[] | undefined, base: string[], locale: Locale): string[] {
  if (Array.isArray(override) && override.length > 0) return override;
  return base.map((item) => translateKnownPhrase(item, locale) ?? item);
}

export function resolveConfigLocale(
  base: TicketingConfigTranslatable,
  translationsRaw: string | null | undefined,
  locale: Locale,
): TicketingConfigTranslatable {
  if (locale === 'fr') return base;
  const translations = parseTranslationsJson<TicketingConfigTranslatable>(translationsRaw);
  const override = translations[locale as TicketingTranslatableLocale] ?? {};
  return {
    pageTitle: pickText(override.pageTitle, base.pageTitle, locale),
    pageSubtitle: pickText(override.pageSubtitle, base.pageSubtitle, locale),
    pageIntro: pickText(override.pageIntro, base.pageIntro, locale),
    eventDate: nonEmpty(override.eventDate) ? override.eventDate : translateFrenchDate(base.eventDate, locale) ?? base.eventDate,
    eventLocation: pickText(override.eventLocation, base.eventLocation, locale),
    ctaButtonText: pickText(override.ctaButtonText, base.ctaButtonText, locale),
  };
}

export function resolvePassLocale(
  base: TicketingPassTranslatable,
  translationsRaw: string | null | undefined,
  locale: Locale,
): TicketingPassTranslatable {
  if (locale === 'fr') return base;
  const translations = parseTranslationsJson<TicketingPassTranslatable>(translationsRaw);
  const override = translations[locale as TicketingTranslatableLocale] ?? {};
  return {
    name: pickText(override.name, base.name, locale),
    label: pickText(override.label, base.label, locale),
    targetAudience: pickText(override.targetAudience, base.targetAudience, locale),
    description: pickText(override.description, base.description, locale),
    highlights: pickList(override.highlights, base.highlights, locale),
    includes: pickList(override.includes, base.includes, locale),
    decisionPhrase: pickText(override.decisionPhrase, base.decisionPhrase, locale),
    availabilityNote: pickText(override.availabilityNote, base.availabilityNote, locale),
  };
}
