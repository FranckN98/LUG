import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const categories = await prisma.socialLinkCategory.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { _count: { select: { links: true } } },
  });

  return NextResponse.json(categories);
}

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
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 });

  const sortOrder = typeof data.sortOrder === 'number' ? data.sortOrder : 0;
  const category = await prisma.socialLinkCategory.create({ data: { name, sortOrder } });
  return NextResponse.json(category, { status: 201 });
}

