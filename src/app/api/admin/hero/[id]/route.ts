import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

// PATCH /api/admin/hero/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();

  // If setting as main, unset all others first
  if (body.isMain) {
    await prisma.heroSlide.updateMany({ data: { isMain: false } });
  }

  const slide = await prisma.heroSlide.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(slide);
}

// DELETE /api/admin/hero/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  await prisma.heroSlide.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
