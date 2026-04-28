import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

// On Vercel the filesystem is read-only at runtime. When BLOB_READ_WRITE_TOKEN is
// present we upload to Vercel Blob instead of /public. Locally we keep writing to
// /public so dev works without any extra service.
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function saveFile(buffer: Buffer, savedFilename: string, subfolder: 'media' | 'community'): Promise<string> {
  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`${subfolder}/${savedFilename}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url; // absolute https URL
  }

  const dir = join(process.cwd(), 'public', subfolder);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, savedFilename), buffer);
  return `/${subfolder}/${savedFilename}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const category = (formData.get('category') as string) || 'general';
  const altText = (formData.get('altText') as string) || '';

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Fichier trop lourd (max 10 Mo).' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uuid = crypto.randomUUID();
  const savedFilename = `${uuid}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (category === 'community') {
    const url = await saveFile(buffer, savedFilename, 'community');
    // Also persist in DB so the public gallery can pick it up in production
    // (where filesystem listing of /public/community is read-only at runtime).
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url,
        altText,
        category: 'community',
        size: file.size,
        mimeType: file.type,
      },
    });
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
      { status: 201 }
    );
  }

  const url = await saveFile(buffer, savedFilename, 'media');
  const media = await prisma.media.create({
    data: {
      filename: file.name,
      url,
      altText,
      category,
      size: file.size,
      mimeType: file.type,
    },
  });

  return NextResponse.json(media, { status: 201 });
}
