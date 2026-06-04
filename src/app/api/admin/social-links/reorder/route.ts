import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const data = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const ids = Array.isArray(data.ids) ? data.ids.filter((x): x is string => typeof x === 'string') : null;

  if (!ids || ids.length === 0) {
    return NextResponse.json({ error: 'Liste d’IDs manquante.' }, { status: 400 });
  }

  await prisma.$transaction(
    ids.map((id, index) =>
      prisma.socialLink.update({ where: { id }, data: { sortOrder: index } }),
    ),
  );

  const updated = await prisma.socialLink.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return NextResponse.json(updated);
}
