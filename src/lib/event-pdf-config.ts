import type { EventEdition } from '@/content/events';

/** Public canonical PDF URLs (served by /pdf/[slug] under www.levelupingermany.com). */
export const EVENT_PDF_PATH: Record<EventEdition, string> = {
  '2025': '/pdf/livre-1re-edition',
  '2026': '/pdf/livre-1re-edition',
};

/** Stored in DB `source` for segmentation / campaigns */
export const EVENT_SOURCE_LABEL: Record<EventEdition, string> = {
  '2025': 'Event 2025',
  '2026': 'Event 2026',
};

export function getSiteOrigin(): string {
  const u = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (u) return u.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Prefer the canonical production host so shared PDF links keep partner trust.
  if (process.env.NODE_ENV === 'production') return 'https://www.levelupingermany.com';
  return 'http://localhost:3000';
}

export function absolutePdfUrl(path: string): string {
  return `${getSiteOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
}
