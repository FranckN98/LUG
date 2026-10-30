import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { syncHeroMediaToSlides } from '@/lib/heroSync';
import { saveMediaFile } from '@/lib/mediaStorage';

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const TYPE_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
};
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

/** Certains navigateurs n'envoient aucun type (ou « image/jpg ») : on se rabat sur l'extension du fichier. */
function resolveImageType(file: File): string | null {
  const declared = file.type === 'image/jpg' ? 'image/jpeg' : file.type;
  if (EXT_BY_TYPE[declared]) return declared;
  const nameExt = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  return TYPE_BY_EXT[nameExt] ?? null;
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Fichier illisible ou trop volumineux pour l'envoi." }, { status: 400 });
  }
  const file = formData.get('file') as File | null;
  const rawCategory = ((formData.get('category') as string) || 'general').trim();
  const category = /^[a-z0-9_-]{1,40}$/i.test(rawCategory) ? rawCategory : 'general';
  const altText = (formData.get('altText') as string) || '';

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }
  const mimeType = resolveImageType(file);
  if (!mimeType) {
    return NextResponse.json(
      { error: "Format non pris en charge. Utilisez JPG, PNG, WebP ou GIF (les photos HEIC d'iPhone doivent être exportées en JPG)." },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop lourd (max 10 Mo).' }, { status: 400 });
  }

  const savedFilename = `${crypto.randomUUID()}.${EXT_BY_TYPE[mimeType]}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  let url: string;
  try {
    // La galerie communauté garde ses fichiers dans /community ; elle est aussi enregistrée en base pour la production (disque en lecture seule).
    url = await saveMediaFile(buffer, savedFilename, category === 'community' ? 'community' : 'media');
  } catch (e) {
    console.error('[media-upload] storage', e);
    const hint = process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN ? ' (BLOB_READ_WRITE_TOKEN manquant sur le serveur)' : '';
    return NextResponse.json({ error: `Enregistrement impossible : stockage des fichiers indisponible${hint}.` }, { status: 500 });
  }

  try {
    const media = await prisma.media.create({
      data: { filename: file.name, url, altText, category, size: file.size, mimeType },
    });
    if (category === 'hero') await syncHeroMediaToSlides().catch(() => undefined);

    return NextResponse.json(
      {
        id: media.id,
        filename: media.filename,
        url: media.url,
        altText: media.altText,
        category: media.category,
        size: media.size,
        mimeType: media.mimeType,
        createdAt: media.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (e) {
    console.error('[media-upload] database', e);
    return NextResponse.json({ error: 'Enregistrement impossible : base de données indisponible.' }, { status: 500 });
  }
}
