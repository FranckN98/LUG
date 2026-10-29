import { prisma } from '@/lib/prisma';
import { isExpiredPresignedUrl } from '@/lib/presignedUrl';

const DEFAULT_FILENAME_PREFIX = 'hero-default-';

/**
 * La médiathèque « hero » et le carousel (HeroSlide) forment une seule liste : toute image de la
 * médiathèque sans diapositive y est ajoutée (active, en fin de liste). Idempotent.
 * Tant qu'il n'y a aucune diapositive, les images par défaut sont reprises aussi pour que le hero reste identique ;
 * ensuite seules les images ajoutées par l'équipe sont importées.
 */
export async function syncHeroMediaToSlides(): Promise<number> {
  const [media, slides] = await Promise.all([
    prisma.media.findMany({ where: { category: 'hero' }, orderBy: { createdAt: 'asc' } }),
    prisma.heroSlide.findMany({ select: { imageUrl: true, sortOrder: true } }),
  ]);

  const used = new Set(slides.map((s) => s.imageUrl));
  const hasSlides = slides.length > 0;
  const fresh = media.filter(
    (m) =>
      m.url &&
      !used.has(m.url) &&
      !isExpiredPresignedUrl(m.url) &&
      (!hasSlides || !m.filename.startsWith(DEFAULT_FILENAME_PREFIX)),
  );
  if (fresh.length === 0) return 0;

  let order = slides.reduce((max, s) => Math.max(max, s.sortOrder), -1) + 1;
  await prisma.heroSlide.createMany({
    data: fresh.map((m) => ({
      imageUrl: m.url,
      isMain: false,
      isActive: true,
      sortOrder: order++,
      altTextFr: m.altText || null,
      altTextDe: m.altText || null,
      altTextEn: m.altText || null,
    })),
  });
  return fresh.length;
}
