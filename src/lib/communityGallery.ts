import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

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

/**
 * Returns the list of images for the public community gallery.
 *
 * Sources, merged in this order:
 *   1. DB-uploaded images (Media table, category = "community") — works on
 *      Vercel/serverless where filesystem writes are not persisted.
 *   2. Images committed to /public/community/ — fallback used in dev or when
 *      the DB has no community media yet.
 *
 * Duplicates (same URL) are de-duplicated.
 */
export async function getPublicCommunityGallery(): Promise<Array<{ src: string; alt: string }>> {
  const seen = new Set<string>();
  const out: Array<{ src: string; alt: string }> = [];

  // 1. DB
  try {
    const rows = await prisma.media.findMany({
      where: { category: 'community' },
      orderBy: { createdAt: 'desc' },
      select: { url: true, altText: true },
    });
    for (const row of rows) {
      if (!row.url || seen.has(row.url)) continue;
      seen.add(row.url);
      out.push({ src: row.url, alt: row.altText || 'Level Up in Germany' });
    }
  } catch {
    // DB unavailable — silently fall back to disk
  }

  // 2. Disk (committed files)
  const communityDir = resolveCommunityDir();
  if (communityDir) {
    const names = fs
      .readdirSync(communityDir, { withFileTypes: true })
      .filter((d) => d.isFile() && IMAGE_EXT.test(d.name) && !d.name.startsWith('.'))
      .map((d) => d.name)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }));

    for (const name of names) {
      const src = `/community/${fileNameToUrlSegment(name)}`;
      if (seen.has(src)) continue;
      seen.add(src);
      out.push({ src, alt: 'Level Up in Germany 2025' });
    }
  }

  return out;
}
