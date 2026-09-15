import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { normalizeTagsInput, parseTags, serializeTags } from '@/lib/newsletterTags';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const { status, tags, firstName, lastName } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) {
    if (!['active', 'unsubscribed'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }
    data.status = status;
  }
  if (Array.isArray(tags)) {
    data.tags = serializeTags(normalizeTagsInput(tags));
  }
  if (firstName !== undefined) data.firstName = String(firstName).trim() || null;
  if (lastName !== undefined) data.lastName = String(lastName).trim() || null;

  const updated = await prisma.newsletterSubscriber.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ ...updated, tags: parseTags(updated.tags) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  await prisma.newsletterSubscriber.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
