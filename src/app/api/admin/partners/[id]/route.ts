import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ALLOWED_CATEGORIES = new Set([
  'partner',
  'sponsor',
  'media-partner',
  'strategic-partner',
  'collaborator',
  'premium-sponsor',
  'gold-sponsor',
  'silver-sponsor',
  'bronze-sponsor',
]);

// PATCH /api/admin/partners/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};

  const data: Record<string, unknown> = {};
  if (typeof record.name === 'string') data.name = record.name.trim();
  if (typeof record.logoUrl === 'string') data.logoUrl = record.logoUrl.trim();
  if ('websiteUrl' in record) {
    data.websiteUrl = typeof record.websiteUrl === 'string' && record.websiteUrl.trim() ? record.websiteUrl.trim() : null;
  }
  if (typeof record.category === 'string' && ALLOWED_CATEGORIES.has(record.category)) data.category = record.category;
  if (typeof record.sortOrder === 'number') data.sortOrder = record.sortOrder;
  if (typeof record.visible === 'boolean') data.visible = record.visible;

  try {
    const partner = await prisma.partner.update({ where: { id }, data });
    return NextResponse.json(partner);
  } catch {
    return NextResponse.json({ error: 'Partenaire introuvable.' }, { status: 404 });
  }
}

// DELETE /api/admin/partners/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.partner.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Partenaire introuvable.' }, { status: 404 });
  }
}
