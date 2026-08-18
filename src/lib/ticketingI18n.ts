import type { Locale } from '@/i18n/config';

// The base TicketingConfig/TicketingPass columns are authored in French (the
// site's default authoring language). `translations` stores optional EN/DE
// overrides as a JSON string: `Partial<Record<'en' | 'de', Partial<Fields>>>`.
// Locale resolution: fr -> base columns; en/de -> base columns overridden by
// whatever is present (non-empty) in translations[locale].

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

export function resolveConfigLocale(
  base: TicketingConfigTranslatable,
  translationsRaw: string | null | undefined,
  locale: Locale,
): TicketingConfigTranslatable {
  if (locale === 'fr') return base;
  const translations = parseTranslationsJson<TicketingConfigTranslatable>(translationsRaw);
  const override = translations[locale as TicketingTranslatableLocale] ?? {};
  return {
    pageTitle: nonEmpty(override.pageTitle) ? override.pageTitle : base.pageTitle,
    pageSubtitle: nonEmpty(override.pageSubtitle) ? override.pageSubtitle : base.pageSubtitle,
    pageIntro: nonEmpty(override.pageIntro) ? override.pageIntro : base.pageIntro,
    eventDate: nonEmpty(override.eventDate) ? override.eventDate : base.eventDate,
    eventLocation: nonEmpty(override.eventLocation) ? override.eventLocation : base.eventLocation,
    ctaButtonText: nonEmpty(override.ctaButtonText) ? override.ctaButtonText : base.ctaButtonText,
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
    name: nonEmpty(override.name) ? override.name : base.name,
    label: nonEmpty(override.label) ? override.label : base.label,
    targetAudience: nonEmpty(override.targetAudience) ? override.targetAudience : base.targetAudience,
    description: nonEmpty(override.description) ? override.description : base.description,
    highlights: Array.isArray(override.highlights) && override.highlights.length > 0 ? override.highlights : base.highlights,
    includes: Array.isArray(override.includes) && override.includes.length > 0 ? override.includes : base.includes,
    decisionPhrase: nonEmpty(override.decisionPhrase) ? override.decisionPhrase : base.decisionPhrase,
    availabilityNote: nonEmpty(override.availabilityNote) ? override.availabilityNote : base.availabilityNote,
  };
}
