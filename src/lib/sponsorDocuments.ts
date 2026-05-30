import { prisma } from '@/lib/prisma';

export const FALLBACK_SPONSOR_PDF = '/downloads/fscon-v2.pdf';

export type PublicSponsorDoc = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  filename: string;
  size: number | null;
  isFeatured: boolean;
};

/**
 * Returns the active sponsor PDF URL (admin-selected) with a fallback
 * to the historical static file when no document is featured yet.
 */
export async function getFeaturedSponsorPdfUrl(): Promise<string> {
  try {
    const doc = await prisma.sponsorDocument.findFirst({
      where: { isFeatured: true, isPublic: true },
      select: { url: true },
    });
    return doc?.url ?? FALLBACK_SPONSOR_PDF;
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
