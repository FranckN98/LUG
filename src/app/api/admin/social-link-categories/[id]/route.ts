import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const current = await prisma.socialLinkCategory.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 404 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }
  const data = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const update: { name?: string; sortOrder?: number } = {};
  if (typeof data.name === 'string') {
    const name = data.name.trim();
    if (!name) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 });
    update.name = name;
  }
  if (typeof data.sortOrder === 'number') update.sortOrder = data.sortOrder;
  return NextResponse.json(await prisma.socialLinkCategory.update({ where: { id }, data: update }));
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  try {
    await prisma.socialLinkCategory.delete({ where: { id } });
    return NextResponse.json({ ok: true, detachedLinks: true });
  } catch {
    return NextResponse.json({ error: 'Catégorie introuvable.' }, { status: 404 });
  }
}
