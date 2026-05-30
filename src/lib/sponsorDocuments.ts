import { prisma } from '@/lib/prisma';

/** Canonical public host used for all professional share links. */
export const PUBLIC_HOST = 'https://www.levelupingermany.com';

export const FALLBACK_SPONSOR_PDF = '/pdf/sponsor-2026';

export type PublicSponsorDoc = {
  id: string;
  slug: string | null;
  title: string;
  description: string | null;
  url: string;
  filename: string;
  size: number | null;
  isFeatured: boolean;
};

function baseSlug(value: string): string {
  return (
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'document'
  );
}

/** Builds a unique slug for SponsorDocument. */
export async function buildUniqueSlug(source: string, ignoreId?: string): Promise<string> {
  const base = baseSlug(source);
  let candidate = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.sponsorDocument.findUnique({ where: { slug: candidate } });
    if (!existing || existing.id === ignoreId) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
}

/** Public, trust-friendly URL: https://www.levelupingermany.com/pdf/<slug> */
export function publicShareUrl(slug: string | null, fallbackUrl: string): string {
  if (slug) return `${PUBLIC_HOST}/pdf/${slug}`;
  if (fallbackUrl.startsWith('http')) return fallbackUrl;
  return `${PUBLIC_HOST}${fallbackUrl.startsWith('/') ? '' : '/'}${fallbackUrl}`;
}

/**
 * Returns the active sponsor PDF URL (admin-selected) with a fallback
 * to the historical static file when no document is featured yet.
 */
export async function getFeaturedSponsorPdfUrl(): Promise<string> {
  try {
    const doc = await prisma.sponsorDocument.findFirst({
      where: { isFeatured: true, isPublic: true },
      select: { url: true, slug: true },
    });
    if (!doc) return FALLBACK_SPONSOR_PDF;
    return doc.slug ? `/pdf/${doc.slug}` : doc.url;
  } catch {
    return FALLBACK_SPONSOR_PDF;
  }
}

export async function listPublicSponsorDocs(): Promise<PublicSponsorDoc[]> {
  try {
    return await prisma.sponsorDocument.findMany({
      where: { isPublic: true },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        url: true,
        filename: true,
        size: true,
        isFeatured: true,
      },
    });
  } catch {
    return [];
  }
}
