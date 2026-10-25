import { describe, expect, it } from 'vitest';
import { localizeModeratorRole, translateFrenchDate, translateKnownPhrase } from '@/lib/ticketingGlossary';
import { resolveConfigLocale, resolvePassLocale } from '@/lib/ticketingI18n';
import { localizeSiteHref } from '@/lib/localizeSiteHref';

const frPass = {
  name: 'Healthcare Excellence Pass',
  label: 'SANTÉ, PFLEGE & OPPORTUNITÉS',
  targetAudience: '',
  description: '',
  highlights: ['Mieux apprendre, mieux s’organiser et réussir sa formation', 'Phrase inconnue du glossaire'],
  includes: [],
  decisionPhrase: '',
  availabilityNote: 'Places limitées',
};

const frConfig = {
  pageTitle: 'Billetterie',
  pageSubtitle: 'Une journée pour accélérer votre avenir en Allemagne.',
  pageIntro: '',
  eventDate: '17 OCTOBRE 2026',
  eventLocation: 'Francfort',
  ctaButtonText: 'Choisir mon billet',
};

describe('translateKnownPhrase', () => {
  it('ignores accents, case, apostrophes and line breaks', () => {
    expect(translateKnownPhrase('Mieux apprendre,\nmieux s\'organiser et reussir sa formation', 'en')).toBe(
      'Learn better, get better organised and succeed in your training',
    );
  });

  it('returns null for French and unknown phrases', () => {
    expect(translateKnownPhrase('Places limitées', 'fr')).toBeNull();
    expect(translateKnownPhrase('Texte inconnu', 'de')).toBeNull();
    expect(translateKnownPhrase(null, 'en')).toBeNull();
  });
});

describe('translateFrenchDate', () => {
  it('translates a French date', () => {
    expect(translateFrenchDate('17 OCTOBRE 2026', 'en')).toBe('17 October 2026');
    expect(translateFrenchDate('17 octobre 2026', 'de')).toBe('17. Oktober 2026');
    expect(translateFrenchDate('Samedi 17 octobre 2026', 'en')).toMatch(/^Saturday,? 17 October 2026$/);
    expect(translateFrenchDate('1er décembre 2026', 'en')).toBe('1 December 2026');
  });

  it('returns null when the text is not a French date', () => {
    expect(translateFrenchDate('Bientôt', 'en')).toBeNull();
    expect(translateFrenchDate('17 octobre 2026', 'fr')).toBeNull();
  });
});

describe('localizeModeratorRole', () => {
  it('localizes the role and fixes the known typo', () => {
    expect(localizeModeratorRole('Moderatrice Career Launch', 'en')).toBe('Moderator Career Launch');
    expect(localizeModeratorRole('Moderatrice Career Launch', 'de')).toBe('Moderatorin Career Launch');
    expect(localizeModeratorRole('Moderateur Heahlcare Excellence', 'de')).toBe('Moderator Healthcare Excellence');
    expect(localizeModeratorRole('Moderateur Heahlcare Excellence', 'fr')).toBe('Modérateur Healthcare Excellence');
  });

  it('leaves other roles untouched', () => {
    expect(localizeModeratorRole('Host', 'en')).toBe('Host');
    expect(localizeModeratorRole(undefined, 'en')).toBe('');
  });
});

describe('resolveConfigLocale / resolvePassLocale', () => {
  it('keeps French as is', () => {
    expect(resolveConfigLocale(frConfig, null, 'fr')).toEqual(frConfig);
    expect(resolvePassLocale(frPass, null, 'fr')).toEqual(frPass);
  });

  it('falls back to the glossary for en/de', () => {
    const en = resolveConfigLocale(frConfig, null, 'en');
    expect(en.eventDate).toBe('17 October 2026');
    expect(en.eventLocation).toBe('Frankfurt');
    expect(en.ctaButtonText).toBe('Choose my ticket');

    const de = resolvePassLocale(frPass, '{}', 'de');
    expect(de.label).toBe('Gesundheit, Pflege & Chancen');
    expect(de.highlights[0]).toBe('Besser lernen, sich besser organisieren und die Ausbildung erfolgreich meistern');
    expect(de.highlights[1]).toBe('Phrase inconnue du glossaire');
    expect(de.availabilityNote).toBe('Begrenzte Plätze');
  });

  it('lets admin translations win over the glossary', () => {
    const translations = JSON.stringify({ en: { label: 'Custom label', highlights: ['Custom highlight'], availabilityNote: 'Almost gone' } });
    const en = resolvePassLocale(frPass, translations, 'en');
    expect(en.label).toBe('Custom label');
    expect(en.highlights).toEqual(['Custom highlight']);
    expect(en.availabilityNote).toBe('Almost gone');

    const cfg = resolveConfigLocale(frConfig, JSON.stringify({ de: { eventDate: '17. Oktober' } }), 'de');
    expect(cfg.eventDate).toBe('17. Oktober');
  });
});

describe('localizeSiteHref', () => {
  it('rewrites the locale of internal links', () => {
    expect(localizeSiteHref('https://www.levelupingermany.com/fr/buy-ticket', 'de')).toBe('/de/buy-ticket');
    expect(localizeSiteHref('/fr/buy-ticket?x=1', 'en')).toBe('/en/buy-ticket?x=1');
    expect(localizeSiteHref('/contact', 'de')).toBe('/de/contact');
    expect(localizeSiteHref('sponsor-donate', 'fr')).toBe('/fr/sponsor-donate');
    expect(localizeSiteHref('https://levelupingermany.de', 'en')).toBe('/en');
    expect(localizeSiteHref('/fr', 'de')).toBe('/de');
  });

  it('keeps external links', () => {
    expect(localizeSiteHref('https://example.com/fr/x', 'de')).toBe('https://example.com/fr/x');
    expect(localizeSiteHref('mailto:a@b.de', 'de')).toBe('mailto:a@b.de');
  });
});
