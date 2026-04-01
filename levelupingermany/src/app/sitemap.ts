import type { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';
import { getSiteUrl } from '@/config/site';
import { SEO_BY_PATH } from '@/content/seo-metadata';

/** Tous les chemins localis\u00e9s list\u00e9s pour l\u2019indexation. */
const PATHS = Object.keys(SEO_BY_PATH);

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const path of PATHS) {
    const suffix = path === '' ? '' : path;
    for (const locale of locales) {
      const locPath = suffix === '' ? `/${locale}` : `/${locale}${suffix}`;
      entries.push({
        url: `${base}${locPath}`,
        lastModified,
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : path.startsWith('/events') ? 0.85 : 0.7,
      });
    }
  }

  entries.push({
    url: `${base}/`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.5,
  });

  return entries;
}
