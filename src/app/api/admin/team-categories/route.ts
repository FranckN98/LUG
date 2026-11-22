import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const categories = await prisma.teamCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { members: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const body = await req.json();
  const nameDe = String(body.nameDe ?? '').trim();
  const nameEn = String(body.nameEn ?? '').trim();
  const nameFr = String(body.nameFr ?? '').trim();
  if (!nameDe || !nameEn || !nameFr) return NextResponse.json({ error: 'Names are required' }, { status: 400 });
  const category = await prisma.teamCategory.create({ data: { nameDe, nameEn, nameFr, sortOrder: Number(body.sortOrder ?? 0) } });
  return NextResponse.json(category);
}

export async function PATCH(req: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.nameDe === 'string') data.nameDe = body.nameDe.trim();
  if (typeof body.nameEn === 'string') data.nameEn = body.nameEn.trim();
  if (typeof body.nameFr === 'string') data.nameFr = body.nameFr.trim();
  if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder;
  const category = await prisma.teamCategory.update({ where: { id }, data });
  return NextResponse.json(category);
}

export async function DELETE(req: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  await prisma.teamCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
