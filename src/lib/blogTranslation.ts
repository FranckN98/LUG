import type { Locale } from '@/i18n/config';

export type BlogTranslationRow = {
  locale: string;
  title: string;
  excerpt: string | null;
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

export type BlogPostWithTranslations = {
  id: string;
  title: string; // legacy fallback
  body: string;  // legacy fallback
  translations?: BlogTranslationRow[];
};

export type LocalizedBlog = {
  title: string;
  body: string;
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  /** locale that was actually used (after fallback) */
  resolvedLocale: Locale | null;
};

// Order in which to look up translations for each requested locale.
// First entry = preferred. Falls back to English, then French, then German.
const FALLBACK_ORDER: Record<Locale, Locale[]> = {
  fr: ['fr', 'en', 'de'],
  en: ['en', 'fr', 'de'],
  de: ['de', 'en', 'fr'],
};

const isFilled = (t: BlogTranslationRow | undefined): t is BlogTranslationRow =>
  !!t && !!t.title?.trim() && !!t.body?.trim();

export function pickBlogTranslation(
  post: BlogPostWithTranslations,
  locale: Locale,
): LocalizedBlog {
  const list = post.translations ?? [];
  for (const l of FALLBACK_ORDER[locale]) {
    const t = list.find((x) => x.locale === l);
    if (isFilled(t)) {
      return {
        title: t.title,
        body: t.body,
        excerpt: t.excerpt,
        metaTitle: t.metaTitle,
        metaDescription: t.metaDescription,
        resolvedLocale: l,
      };
    }
  }
  // Legacy fallback (pre-i18n posts).
  return {
    title: post.title,
    body: post.body,
    excerpt: null,
    metaTitle: null,
    metaDescription: null,
    resolvedLocale: null,
  };
}

export const BLOG_LOCALES: Locale[] = ['fr', 'en', 'de'];

export type BlogTranslationInput = {
  title?: string;
  body?: string;
  excerpt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

export type BlogTranslationsPayload = Partial<Record<Locale, BlogTranslationInput>>;

/**
 * Normalize a translations payload coming from the admin form.
 * - Trims strings; converts blanks → null for optional fields.
 * - Drops locales whose required fields (title + body) are empty.
 */
export function normalizeBlogTranslations(
  input: BlogTranslationsPayload | undefined,
): Array<{ locale: Locale; title: string; body: string; excerpt: string | null; metaTitle: string | null; metaDescription: string | null }> {
  if (!input) return [];
  const result: Array<{ locale: Locale; title: string; body: string; excerpt: string | null; metaTitle: string | null; metaDescription: string | null }> = [];
  for (const locale of BLOG_LOCALES) {
    const raw = input[locale];
    if (!raw) continue;
    const title = (raw.title ?? '').trim();
    const body = (raw.body ?? '').trim();
    if (!title || !body) continue;
    const cleanOpt = (v: string | null | undefined) => {
      if (v == null) return null;
      const s = String(v).trim();
      return s.length ? s : null;
    };
    result.push({
      locale,
      title,
      body,
      excerpt: cleanOpt(raw.excerpt),
      metaTitle: cleanOpt(raw.metaTitle),
      metaDescription: cleanOpt(raw.metaDescription),
    });
  }
  return result;
}

/**
 * Pick the best legacy title/body to mirror onto BlogPost.title / BlogPost.body
 * (those columns remain NOT NULL for backwards-compat).
 * Prefers FR → EN → DE, in that order.
 */
export function pickLegacyMirror(
  translations: Array<{ locale: Locale; title: string; body: string }>,
): { title: string; body: string } | null {
  for (const l of BLOG_LOCALES) {
    const t = translations.find((x) => x.locale === l);
    if (t) return { title: t.title, body: t.body };
  }
  return null;
}
