import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { buildUniqueSlug } from '@/lib/sponsorDocuments';

const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
const ALLOWED_TYPES = new Set(['application/pdf']);

const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'document';
}

async function saveFile(buffer: Buffer, savedFilename: string): Promise<string> {
  if (useBlob) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`sponsor-documents/${savedFilename}`, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url;
  }
  const dir = join(process.cwd(), 'public', 'downloads');
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, savedFilename), buffer);
  return `/downloads/${savedFilename}`;
}

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  // Backfill slugs for any legacy rows that don't have one yet.
  const missing = await prisma.sponsorDocument.findMany({
    where: { slug: null },
    select: { id: true, title: true },
  });
  for (const row of missing) {
    const slug = await buildUniqueSlug(row.title, row.id);
    await prisma.sponsorDocument.update({ where: { id: row.id }, data: { slug } });
  }

  const docs = await prisma.sponsorDocument.findMany({
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
  });
  return NextResponse.json(docs);
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  const title = ((formData.get('title') as string) || '').trim();
  const description = ((formData.get('description') as string) || '').trim();
  const isPublic = formData.get('isPublic') !== 'false';

  if (!file) {
    return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Seuls les fichiers PDF sont autorisés.' }, { status: 400 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Fichier vide.' }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: `Fichier trop lourd (max ${Math.round(MAX_SIZE / 1024 / 1024)} Mo).` }, { status: 400 });
  }

  const originalName = file.name || 'document.pdf';
  const base = originalName.replace(/\.pdf$/i, '');
  const savedFilename = `${slugify(base)}-${Date.now()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const url = await saveFile(buffer, savedFilename);

  const finalTitle = title || base;
  const slug = await buildUniqueSlug(finalTitle);

  const doc = await prisma.sponsorDocument.create({
    data: {
      title: finalTitle,
      slug,
      description: description || null,
      filename: originalName,
      url,
      size: file.size,
      mimeType: file.type,
      isPublic,
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
