import fs from 'fs';
import path from 'path';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp)$/i;

/** Segment d’URL sûr pour un nom de fichier (évite d’encoder inutilement). */
function fileNameToUrlSegment(name: string): string {
  if (/^[a-zA-Z0-9._-]+$/.test(name)) return name;
  return encodeURIComponent(name);
}

function toPublicUrl(year: string, fileName: string): string {
  const seg = fileNameToUrlSegment(fileName);
  return `/events/${year}/${seg}`;
}

function resolveEventsDir(year: string): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 8; i++) {
    const candidate = path.join(dir, 'public', 'events', year);
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Liste les images dans public/events/{year}/ pour alimenter la galerie.
 */
export function getPublicEventGallery(year: '2025' | '2026'): string[] {
  const eventsDir = resolveEventsDir(year);
  if (!eventsDir) return [];

  return fs
    .readdirSync(eventsDir, { withFileTypes: true })
    .filter((d) => d.isFile() && IMAGE_EXT.test(d.name) && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }))
    .map((name) => toPublicUrl(year, name));
}
