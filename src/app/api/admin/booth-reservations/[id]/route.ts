import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUS = new Set(['new', 'in_review', 'accepted', 'rejected', 'contacted']);

export async function PATCH(req: NextRequest, { params }: Params) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body?.status ?? '').trim();
  if (!ALLOWED_STATUS.has(status)) {
    return NextResponse.json({ error: 'invalid_status' }, { status: 400 });
  }

  try {
    const updated = await prisma.boothReservation.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await prisma.boothReservation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
}
