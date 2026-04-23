import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

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

  // Generate unique filename: uuid + original extension
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const uuid = crypto.randomUUID();
  const savedFilename = `${uuid}.${ext}`;

  if (category === 'community') {
    const communityDir = join(process.cwd(), 'public', 'community');
    await mkdir(communityDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(join(communityDir, savedFilename), buffer);

    return NextResponse.json(
      {
        id: `community:${savedFilename}`,
        filename: file.name,
        url: `/community/${savedFilename}`,
        altText,
        category,
        size: file.size,
        mimeType: file.type,
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }

  // Ensure /public/media/ exists
  const mediaDir = join(process.cwd(), 'public', 'media');
  await mkdir(mediaDir, { recursive: true });

  // Write file to disk
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(join(mediaDir, savedFilename), buffer);

  const url = `/media/${savedFilename}`;

  // Save metadata to DB
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
