import type { Locale } from '@/i18n/config';
import { LEGACY_LOCALE_PATH_REDIRECTS } from '@/lib/legacyUrlRedirects';

/** Segment d\u2019URL unique (anglais) pour la page \u00e9quipe. */
export const WHO_WE_ARE_PATH = '/who-we-are';

export function whoWeAreHref(locale: Locale): string {
  return `/${locale}${WHO_WE_ARE_PATH}`;
}

function canonicalPathAfterLocale(pathAfterLocale: string): string {
  const normalized = pathAfterLocale.replace(/\/$/, '') || '/';
  return LEGACY_LOCALE_PATH_REDIRECTS[normalized] ?? normalized;
}

/**
 * S\u00e9lecteur de langue : m\u00eame slug partout (anglais), y compris anciennes URL.
 */
export function localeSwitcherHref(pathname: string, targetLocale: Locale): string {
  const clean = pathname.replace(/\/$/, '') || '/';
  const m = clean.match(/^\/(de|en|fr)(\/.*)?$/);
  if (!m) return `/${targetLocale}`;
  const pathAfterLocale = m[2] ?? '';
  if (!pathAfterLocale || pathAfterLocale === '/') {
    return `/${targetLocale}`;
  }
  const nextPath = canonicalPathAfterLocale(pathAfterLocale);
  return `/${targetLocale}${nextPath}`;
}

export function isWhoWeArePathname(pathname: string): boolean {
  const n = pathname.replace(/\/$/, '') || '/';
  const m = n.match(/^\/(de|en|fr)(\/[^?#]*)?$/);
  if (!m) return false;
  const sub = (m[2] || '').replace(/\/$/, '') || '';
  if (!sub) return false;
  const canonical = LEGACY_LOCALE_PATH_REDIRECTS[sub] ?? sub;
  return canonical === WHO_WE_ARE_PATH;
}
