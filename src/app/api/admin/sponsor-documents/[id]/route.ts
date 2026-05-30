import { NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { buildUniqueSlug } from '@/lib/sponsorDocuments';

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON invalide.' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};
  if (typeof body.title === 'string') data.title = body.title.trim();
  if (typeof body.description === 'string') data.description = body.description.trim() || null;
  if (typeof body.isPublic === 'boolean') data.isPublic = body.isPublic;
  if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;
  if (typeof body.slug === 'string' && body.slug.trim()) {
    data.slug = await buildUniqueSlug(body.slug.trim(), params.id);
  }

  // If marking as featured, unset all other featured docs in a transaction.
  if (typeof body.isFeatured === 'boolean') {
    if (body.isFeatured === true) {
      await prisma.$transaction([
        prisma.sponsorDocument.updateMany({
          where: { isFeatured: true, NOT: { id: params.id } },
          data: { isFeatured: false },
        }),
        prisma.sponsorDocument.update({
          where: { id: params.id },
          data: { ...data, isFeatured: true },
        }),
      ]);
      const updated = await prisma.sponsorDocument.findUnique({ where: { id: params.id } });
      return NextResponse.json(updated);
    } else {
      data.isFeatured = false;
    }
  }

  const updated = await prisma.sponsorDocument.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, { params }: Params) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const doc = await prisma.sponsorDocument.findUnique({ where: { id: params.id } });
  if (!doc) {
    return NextResponse.json({ error: 'Introuvable.' }, { status: 404 });
  }

  // Best-effort file cleanup. On Vercel blob, we'd need the @vercel/blob `del`.
  try {
    if (doc.url.startsWith('/downloads/')) {
      const filename = doc.url.replace('/downloads/', '');
      await unlink(join(process.cwd(), 'public', 'downloads', filename));
    } else if (doc.url.startsWith('http') && process.env.BLOB_READ_WRITE_TOKEN) {
      const { del } = await import('@vercel/blob');
      await del(doc.url);
    }
  } catch {
    // Ignore — DB row deletion is the source of truth.
  }

  await prisma.sponsorDocument.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
