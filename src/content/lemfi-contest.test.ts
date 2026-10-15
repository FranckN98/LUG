import { describe, expect, it } from 'vitest';
import { lemfiCopy, getLemfiCopy, resolveLemfiLocale, type LemfiCopy } from '@/content/lemfi-contest';
import { SEO_BY_PATH } from '@/content/seo-metadata';

/** Aplatit un objet de textes en `chemin → valeur` ; les fonctions sont évaluées avec des valeurs d'essai. */
function flatten(obj: unknown, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else if (typeof v === 'function') out[key] = (v as (a: never) => string)('Awa' as never);
    else if (v && typeof v === 'object') Object.assign(out, flatten(v, key));
  }
  return out;
}

describe('lemfi contest copy (fr / en / de)', () => {
  const fr = flatten(lemfiCopy.fr);

  it('has exactly the same keys in all three languages', () => {
    for (const loc of ['en', 'de'] as const) {
      expect(Object.keys(flatten(lemfiCopy[loc])).sort()).toEqual(Object.keys(fr).sort());
    }
  });

  it('has no empty or untranslated placeholder text', () => {
    for (const loc of ['fr', 'en', 'de'] as const) {
      for (const [key, value] of Object.entries(flatten(lemfiCopy[loc]))) {
        expect(value.trim().length, `${loc}.${key}`).toBeGreaterThan(0);
        expect(value, `${loc}.${key}`).not.toMatch(/undefined|\[object|TODO|\[LIEN/);
      }
    }
  });

  it('really translates (en and de differ from fr on user-facing sentences)', () => {
    const keys = ['notice', 'intro', 'step1.title', 'step2.title', 'step3.title', 'cta', 'form.submit', 'success.received', 'errors.email_taken'];
    for (const loc of ['en', 'de'] as const) {
      const flat = flatten(lemfiCopy[loc]);
      for (const k of keys) expect(flat[k], `${loc}.${k}`).not.toBe(fr[k]);
    }
  });

  it('keeps the mandatory French wording unchanged', () => {
    expect(lemfiCopy.fr.notice).toBe('Concours réservé aux personnes qui participeront à Level Up in Germany.');
    expect(lemfiCopy.fr.cta).toBe('À vous de jouer !');
    expect(lemfiCopy.fr.form.submit).toBe('Envoyer ma participation');
    expect(lemfiCopy.fr.step1.button).toBe('Télécharger LemFi');
    expect(lemfiCopy.fr.success.received).toBe('Participation reçue.');
    expect(lemfiCopy.fr.success.eligibility).toBe(
      'Votre éligibilité au tirage sera confirmée après vérification de votre preuve.',
    );
    expect(lemfiCopy.fr.form.proofInstructions).toBe(
      'Laissez visibles le montant, la date et la confirmation du transfert. Masquez votre solde et les informations sensibles.',
    );
    expect(lemfiCopy.fr.errors.full).toBe('Inscriptions complètes');
  });

  it('keeps the code LEVELUP and the 10 € minimum in every language', () => {
    for (const loc of ['fr', 'en', 'de'] as const) {
      expect(lemfiCopy[loc].step2.title).toContain('LEVELUP');
      expect(lemfiCopy[loc].step2.title).toMatch(/10\s?€|€10/);
    }
  });

  it('falls back safely on an unknown locale', () => {
    expect(resolveLemfiLocale('xx')).toBe('fr');
    expect(resolveLemfiLocale(undefined, 'en')).toBe('en');
    expect(getLemfiCopy('de')).toBe(lemfiCopy.de as LemfiCopy);
  });

  it('is registered for SEO and the sitemap in the three languages', () => {
    const seo = SEO_BY_PATH['/lemfi-contest'];
    expect(seo).toBeDefined();
    for (const loc of ['fr', 'en', 'de'] as const) {
      expect(seo![loc].title.length).toBeGreaterThan(5);
      expect(seo![loc].description.length).toBeGreaterThan(40);
    }
  });
});
