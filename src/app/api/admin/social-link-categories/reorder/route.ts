import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;
  const body = (await request.json()) as { ids?: unknown };
  const ids = Array.isArray(body.ids) ? body.ids.filter((id): id is string => typeof id === 'string') : [];
  if (!ids.length) return NextResponse.json({ error: 'Liste d’IDs manquante.' }, { status: 400 });
  await prisma.$transaction(ids.map((id, index) => prisma.socialLinkCategory.update({ where: { id }, data: { sortOrder: index } })));
  return NextResponse.json(await prisma.socialLinkCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] }));
}
