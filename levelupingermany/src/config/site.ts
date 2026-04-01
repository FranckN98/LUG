/**
 * URL canonique du site (SEO, sitemap, Open Graph, JSON-LD).
 * D\u00e9finir NEXT_PUBLIC_SITE_URL en production (ex. https://levelupingermany.com).
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, '');
  return 'https://levelupingermany.com';
}

export const SITE_NAME = 'Level Up in Germany';

export function getGoogleSiteVerification(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || undefined;
}
