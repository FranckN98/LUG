import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { resolveSocialLinkCoverImage } from '@/lib/socialLinks';

function parseUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith('/')) return value;
  if (value.startsWith('mailto:') || value.startsWith('tel:')) return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return value;
    return null;
  } catch {
    return null;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  const current = await prisma.socialLink.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: 'Lien introuvable.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const data: Record<string, unknown> = {};

  if (typeof record.title === 'string') {
    const title = record.title.trim();
    if (!title) return NextResponse.json({ error: 'Le titre est requis.' }, { status: 400 });
    data.title = title;
  }

  if ('url' in record) {
    const url = parseUrl(record.url);
    if (!url) return NextResponse.json({ error: 'URL invalide.' }, { status: 400 });
    data.url = url;
  }

  if (typeof record.description === 'string') data.description = record.description.trim();
  if ('coverImageUrl' in record) {
    data.coverImageUrl =
      typeof record.coverImageUrl === 'string' && record.coverImageUrl.trim()
        ? record.coverImageUrl.trim()
        : resolveSocialLinkCoverImage(
            typeof data.title === 'string' ? data.title : current.title,
            typeof data.url === 'string' ? data.url : current.url,
          );
  } else {
    const hasCurrentCover = Boolean(current.coverImageUrl && current.coverImageUrl.trim());
    if (!hasCurrentCover) {
      data.coverImageUrl = resolveSocialLinkCoverImage(
        typeof data.title === 'string' ? data.title : current.title,
        typeof data.url === 'string' ? data.url : current.url,
      );
    }
  }
  if (typeof record.sortOrder === 'number') data.sortOrder = record.sortOrder;
  if (typeof record.isActive === 'boolean') data.isActive = record.isActive;

  try {
    const updated = await prisma.socialLink.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Lien introuvable.' }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  try {
    await prisma.socialLink.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Lien introuvable.' }, { status: 404 });
  }
}
