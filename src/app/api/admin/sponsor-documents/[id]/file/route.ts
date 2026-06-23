import { NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

const MAX_SIZE = 100 * 1024 * 1024; // 100 MB (covers full book PDFs)
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

async function removeOldFile(url: string): Promise<void> {
  try {
    if (url.startsWith('/downloads/')) {
      const filename = url.replace('/downloads/', '');
      await unlink(join(process.cwd(), 'public', 'downloads', filename));
    } else if (url.startsWith('http') && process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import('@vercel/blob');
      await del(url);
    }
  } catch {
    // Best-effort: DB row is the source of truth.
  }
}

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const existing = await prisma.sponsorDocument.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: 'Introuvable.' }, { status: 404 });
  }

  const contentType = request.headers.get('content-type') || '';

  // ── Path A — Finalize a client-direct upload (browser → Vercel Blob) ──
  if (contentType.includes('application/json')) {
    let payload: { url?: string; filename?: string; size?: number; mimeType?: string };
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
    }

    const url = (payload.url || '').trim();
    const filename = (payload.filename || 'document.pdf').trim();
    const size = Number(payload.size ?? 0);
    const mimeType = (payload.mimeType || 'application/pdf').trim();

    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json({ error: 'URL Blob invalide.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont autorisés.' }, { status: 400 });
    }
    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json({ error: 'Taille invalide.' }, { status: 400 });
    }
    if (size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Fichier trop lourd (max ${Math.round(MAX_SIZE / 1024 / 1024)} Mo).` },
        { status: 400 },
      );
    }

    const updated = await prisma.sponsorDocument.update({
      where: { id: params.id },
      data: { filename, url, size, mimeType },
    });

    if (existing.url && existing.url !== url) {
      await removeOldFile(existing.url);
    }

    return NextResponse.json(updated);
  }

  // ── Path B — Legacy multipart upload (small files / local dev) ──
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
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
    return NextResponse.json(
      { error: `Fichier trop lourd (max ${Math.round(MAX_SIZE / 1024 / 1024)} Mo).` },
      { status: 400 },
    );
  }

  const originalName = file.name || 'document.pdf';
  const base = originalName.replace(/\.pdf$/i, '');
  const savedFilename = `${slugify(base)}-${Date.now()}.pdf`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const newUrl = await saveFile(buffer, savedFilename);

  const updated = await prisma.sponsorDocument.update({
    where: { id: params.id },
    data: {
      filename: originalName,
      url: newUrl,
      size: file.size,
      mimeType: file.type,
    },
  });

  // Best-effort cleanup of the old file after the DB row is safely updated.
  if (existing.url && existing.url !== newUrl) {
    await removeOldFile(existing.url);
  }

  return NextResponse.json(updated);
}
