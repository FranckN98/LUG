import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const body = await req.json();
  const { status } = body;

  if (!['active', 'unsubscribed'].includes(status)) {
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
  }

  const updated = await prisma.newsletterSubscriber.update({
    where: { id: params.id },
    data: { status },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  await prisma.newsletterSubscriber.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
