import fs from 'fs';
import path from 'path';

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

export function getPublicCommunityGallery(): Array<{ src: string; alt: string }> {
  const communityDir = resolveCommunityDir();
  if (!communityDir) return [];

  return fs
    .readdirSync(communityDir, { withFileTypes: true })
    .filter((d) => d.isFile() && IMAGE_EXT.test(d.name) && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }))
    .map((name) => ({
      src: `/community/${fileNameToUrlSegment(name)}`,
      alt: 'Level Up in Germany 2025',
    }));
}
