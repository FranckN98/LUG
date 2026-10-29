import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { isExpiredPresignedUrl } from '@/lib/presignedUrl';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;

function fileNameToUrlSegment(name: string): string {
  if (/^[a-zA-Z0-9._-]+$/.test(name)) return name;
  return encodeURIComponent(name);
}

function resolveCommunityDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, 'public', 'community');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

export type CommunityGalleryItem = {
  /** Id de la ligne en base (téléversement) ou « community:<fichier> » (fichier du site). */
  id: string;
  url: string;
  filename: string;
  altText: string | null;
  /** `upload` : téléversé depuis l'admin (modifiable) ; `site` : fichier versionné dans public/community. */
  source: 'upload' | 'site';
  createdAt: string | null;
  /** Lien S3 signé expiré : l'image ne s'affiche plus et n'est pas publiée. */
  expired: boolean;
  /** Fichier du site retiré de la galerie : id du marqueur en base (sert à le restaurer), sinon null. */
  hiddenId: string | null;
};

/**
 * Galerie communauté du bas de l'accueil — indépendante des images du Hero.
 *
 * Sources, dans cet ordre :
 *   1. Téléversements admin (table Media, category = "community") — fonctionnent sur Vercel,
 *      où le système de fichiers est en lecture seule.
 *   2. Images versionnées dans /public/community/.
 *
 * Les doublons (même URL) sont ignorés.
 */
export async function listCommunityGalleryItems(): Promise<CommunityGalleryItem[]> {
  const seen = new Set<string>();
  const out: CommunityGalleryItem[] = [];
  const hiddenByUrl = new Map<string, string>();

  try {
    const hiddenRows = await prisma.media.findMany({
      where: { category: 'community_hidden' },
      select: { id: true, url: true },
    });
    for (const row of hiddenRows) hiddenByUrl.set(row.url, row.id);

    const rows = await prisma.media.findMany({
      where: { category: 'community' },
      orderBy: { createdAt: 'desc' },
      select: { id: true, url: true, filename: true, altText: true, createdAt: true },
    });
    for (const row of rows) {
      if (!row.url || seen.has(row.url)) continue;
      seen.add(row.url);
      out.push({
        id: row.id,
        url: row.url,
        filename: row.filename,
        altText: row.altText || null,
        source: 'upload',
        createdAt: row.createdAt.toISOString(),
        expired: isExpiredPresignedUrl(row.url),
        hiddenId: null,
      });
    }
  } catch {
    // Base indisponible : on retombe sur les fichiers du site.
  }

  const communityDir = resolveCommunityDir();
  if (communityDir) {
    const names = fs
      .readdirSync(communityDir, { withFileTypes: true })
      .filter((d) => d.isFile() && IMAGE_EXT.test(d.name) && !d.name.startsWith('.'))
      .map((d) => d.name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));

    for (const name of names) {
      const url = `/community/${fileNameToUrlSegment(name)}`;
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({
        id: `community:${name}`,
        url,
        filename: name,
        altText: null,
        source: 'site',
        createdAt: null,
        expired: false,
        hiddenId: hiddenByUrl.get(url) ?? null,
      });
    }
  }

  return out;
}

export async function getPublicCommunityGallery(): Promise<Array<{ src: string; alt: string }>> {
  const items = (await listCommunityGalleryItems()).filter((item) => !item.expired && !item.hiddenId);
  return items.map((item) => ({
    src: item.url,
    alt: item.altText || (item.source === 'site' ? 'Level Up in Germany 2025' : 'Level Up in Germany'),
  }));
}
