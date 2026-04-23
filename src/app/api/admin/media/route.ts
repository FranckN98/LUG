import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HERO_IMAGES } from '@/lib/heroDefaults';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)$/i;

function deriveFilenameFromUrl(url: string) {
  const rawSegment = url.split('/').pop()?.split('?')[0] || 'image';

  try {
    return decodeURIComponent(rawSegment) || 'image';
  } catch {
    return rawSegment;
  }
}

function toCommunityItem(fileName: string) {
  return {
    id: `community:${fileName}`,
    url: `/community/${encodeURIComponent(fileName)}`,
    filename: fileName,
    altText: null,
    category: 'community',
    size: null,
    mimeType: null,
    createdAt: new Date(0).toISOString(),
  };
}

function listCommunityItems() {
  const communityDir = join(process.cwd(), 'public', 'community');
  if (!fs.existsSync(communityDir)) return [];

  return fs
    .readdirSync(communityDir, { withFileTypes: true })
    .filter((d) => d.isFile() && IMAGE_EXT.test(d.name) && !d.name.startsWith('.'))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }))
    .map(toCommunityItem);
}

// GET /api/admin/media?category=blog
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (!category || category === 'all' || category === 'hero') {
    const heroCount = await prisma.media.count({ where: { category: 'hero' } });
    if (heroCount === 0) {
      await prisma.media.createMany({
        data: DEFAULT_HERO_IMAGES.map((url, index) => ({
          filename: `hero-default-${index + 1}`,
          url,
          altText: '',
          category: 'hero',
          size: null,
          mimeType: null,
        })),
      });
    }
  }

  if (category === 'community') {
    return NextResponse.json(listCommunityItems());
  }

  const media = await prisma.media.findMany({
    where: category && category !== 'all' ? { category } : undefined,
    orderBy: { createdAt: 'desc' },
  });

  if (!category || category === 'all') {
    return NextResponse.json([...listCommunityItems(), ...media]);
  }

  return NextResponse.json(media);
}

// POST /api/admin/media — enregistre une URL externe (ex: AWS S3) sans upload fichier
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const url = typeof record.url === 'string' ? record.url.trim() : '';
  const filename = typeof record.filename === 'string' ? record.filename.trim() : '';
  const altText = typeof record.altText === 'string' ? record.altText.trim() : '';
  const category = typeof record.category === 'string' ? record.category.trim() : 'general';

  if (!url) {
    return NextResponse.json({ error: 'URL requise.' }, { status: 400 });
  }

  // Sécurité: on n'accepte que https:// ou des chemins relatifs /...
  if (!url.startsWith('/')) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return NextResponse.json({ error: 'URL invalide.' }, { status: 400 });
    }
    if (parsed.protocol !== 'https:') {
      return NextResponse.json({ error: 'Seules les URLs HTTPS sont acceptées.' }, { status: 400 });
    }
    const blocked = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
    if (blocked.includes(parsed.hostname) || parsed.hostname.endsWith('.local') || parsed.hostname.endsWith('.internal')) {
      return NextResponse.json({ error: 'Hôte non autorisé.' }, { status: 400 });
    }
  }

  const derivedFilename = filename || deriveFilenameFromUrl(url);

  const media = await prisma.media.create({
    data: {
      filename: derivedFilename,
      url,
      altText,
      category,
      size: null,
      mimeType: null,
    },
  });

  return NextResponse.json(media, { status: 201 });
}

// DELETE /api/admin/media?id=xxx
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 });
  }

  if (id.startsWith('community:')) {
    const fileName = id.slice('community:'.length);
    if (!fileName || fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
      return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 });
    }
    const filePath = join(process.cwd(), 'public', 'community', fileName);
    await unlink(filePath).catch(() => {/* ignore if already gone */});
    return NextResponse.json({ ok: true });
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  }

  // Delete file from disk (only for /media/ uploads, not external URLs)
  if (media.url.startsWith('/media/')) {
    const filePath = join(process.cwd(), 'public', media.url.replace(/^\/+/, ''));
    await unlink(filePath).catch(() => {/* ignore if already gone */});
  }

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
