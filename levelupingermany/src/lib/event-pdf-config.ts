import type { EventEdition } from '@/content/events';

/** PDF public paths (under /public) — validated server-side; do not trust client paths. */
export const EVENT_PDF_PATH: Record<EventEdition, string> = {
  '2025': '/downloads/level-up-livre-1re-edition.pdf',
  '2026': '/downloads/level-up-livre-1re-edition.pdf',
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
  return 'http://localhost:3000';
}

export function absolutePdfUrl(path: string): string {
  return `${getSiteOrigin()}${path.startsWith('/') ? path : `/${path}`}`;
}
