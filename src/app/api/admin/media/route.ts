import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { DEFAULT_HERO_IMAGES } from '@/lib/heroDefaults';
import { requireAdmin } from '@/lib/adminAuth';
import { syncHeroMediaToSlides } from '@/lib/heroSync';
import { isPresignedS3Url } from '@/lib/presignedUrl';
import { RehostError, rehostPresignedImage } from '@/lib/rehostImage';

function deriveFilenameFromUrl(url: string) {
  const rawSegment = url.split('/').pop()?.split('?')[0] || 'image';

  try {
    return decodeURIComponent(rawSegment) || 'image';
  } catch {
    return rawSegment;
  }
}

// GET /api/admin/media?category=blog
// Les catégories `hero` et `community` ont chacune leur espace d'édition dédié : elles ne sont pas mélangées dans la liste générale.
const HIDDEN_COMMUNITY_CATEGORY = 'community_hidden';
const HOME_ONLY_CATEGORIES = ['hero', 'community', HIDDEN_COMMUNITY_CATEGORY];

const LOCAL_UPLOAD = /^\/(media|community)\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.\w+$/i;
const BLOB_HOST = /\.public\.blob\.vercel-storage\.com$/i;

/** Supprime le fichier d'un téléversement (disque local ou Vercel Blob). Les fichiers du projet ne sont jamais touchés. */
async function removeStoredFile(url: string) {
  try {
    if (LOCAL_UPLOAD.test(url)) {
      await unlink(join(process.cwd(), 'public', url.replace(/^\/+/, '')));
    } else if (process.env.BLOB_READ_WRITE_TOKEN && BLOB_HOST.test(new URL(url).hostname)) {
      const { del } = await import('@vercel/blob');
      await del(url);
    }
  } catch {
    // fichier déjà absent
  }
}

export async function GET(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  if (category === 'hero') {
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

  const isGeneral = !category || category === 'all';
  const media = await prisma.media.findMany({
    where: isGeneral ? { category: { notIn: HOME_ONLY_CATEGORIES } } : { category },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(media);
}

// POST /api/admin/media — enregistre une URL externe (ex: AWS S3) sans upload fichier
export async function POST(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

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

  // Un lien S3 signé expire en quelques minutes : on héberge l'image sur le site pour qu'elle reste affichée.
  let storedUrl = url;
  let storedSize: number | null = null;
  let storedType: string | null = null;
  if (isPresignedS3Url(url)) {
    try {
      const saved = await rehostPresignedImage(url, category === 'community' ? 'community' : 'media');
      storedUrl = saved.url;
      storedSize = saved.size;
      storedType = saved.mimeType;
    } catch (e) {
      if (e instanceof RehostError) return NextResponse.json({ error: e.message }, { status: e.status });
      return NextResponse.json({ error: "Enregistrement de l'image impossible (stockage indisponible)." }, { status: 500 });
    }
  }

  const media = await prisma.media.create({
    data: {
      filename: derivedFilename,
      url: storedUrl,
      altText,
      category,
      size: storedSize,
      mimeType: storedType,
    },
  });
  if (category === 'hero') await syncHeroMediaToSlides().catch(() => undefined);

  return NextResponse.json(media, { status: 201 });
}

// DELETE /api/admin/media?id=xxx
export async function DELETE(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'id requis' }, { status: 400 });
  }

  if (id.startsWith('community:')) {
    // Fichier versionné dans public/community : en production le disque est en lecture seule, on le masque donc (réversible).
    const fileName = id.slice('community:'.length);
    if (!fileName || fileName.includes('/') || fileName.includes('\\') || fileName.includes('..')) {
      return NextResponse.json({ error: 'Nom de fichier invalide' }, { status: 400 });
    }
    const url = `/community/${encodeURIComponent(fileName)}`;
    const existing = await prisma.media.findFirst({ where: { category: HIDDEN_COMMUNITY_CATEGORY, url } });
    if (!existing) {
      await prisma.media.create({
        data: { filename: fileName, url, altText: '', category: HIDDEN_COMMUNITY_CATEGORY, size: null, mimeType: null },
      });
    }
    return NextResponse.json({ ok: true });
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  }

  await prisma.media.delete({ where: { id } });
  // Une ligne « masquée » n'est qu'un marqueur : la supprimer (restaurer) ne doit pas toucher au fichier.
  if (media.category !== HIDDEN_COMMUNITY_CATEGORY) {
    await removeStoredFile(media.url);
    if (media.category === 'hero') await prisma.heroSlide.deleteMany({ where: { imageUrl: media.url } });
  }
  return NextResponse.json({ ok: true });
}
