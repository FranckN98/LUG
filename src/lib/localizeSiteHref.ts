import { locales, type Locale } from '@/i18n/config';

const SITE_ORIGIN = /^https?:\/\/(?:www\.)?levelupingermany\.(?:com|de)(?=[/?#]|$)/i;
const LOCALE_PREFIX = new RegExp(`^/(?:${locales.join('|')})(?=[/?#]|$)`);

/**
 * Cible d'un lien configuré dans l'admin → lien dans la langue courante.
 * - lien externe (autre domaine) : inchangé ;
 * - lien interne (relatif ou absolu vers levelupingermany.com/.de) : préfixe de langue remplacé par `locale`
 *   (« /fr/buy-ticket » devient « /de/buy-ticket » en allemand, « /contact » devient « /de/contact »).
 */
export function localizeSiteHref(target: string, locale: Locale): string {
  const trimmed = target.trim();
  const withoutOrigin = trimmed.replace(SITE_ORIGIN, '');
  if (/^[a-z][a-z0-9+.-]*:/i.test(withoutOrigin) || withoutOrigin.startsWith('//')) return trimmed;

  let path = withoutOrigin.startsWith('/') ? withoutOrigin : `/${withoutOrigin}`;
  path = path.replace(LOCALE_PREFIX, '');
  if (path === '/') path = '';
  return `/${locale}${path}`;
}
