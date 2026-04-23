import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { partners2025 } from '@/content/partners';

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

// GET /api/admin/partners
export async function GET() {
  const count = await prisma.partner.count();
  if (count === 0 && partners2025.length > 0) {
    await prisma.partner.createMany({
      data: partners2025.map((p, i) => ({
        name: p.name,
        logoUrl: p.logo,
        websiteUrl: p.website ?? null,
        category: 'partner',
        sortOrder: i,
        visible: true,
      })),
    });
  }

  const partners = await prisma.partner.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(partners);
}

// POST /api/admin/partners — create
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const record = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'Le nom est requis.' }, { status: 400 });

  const partner = await prisma.partner.create({
    data: {
      name,
      logoUrl: typeof record.logoUrl === 'string' ? record.logoUrl.trim() : '',
      websiteUrl: typeof record.websiteUrl === 'string' && record.websiteUrl.trim() ? record.websiteUrl.trim() : null,
      category: typeof record.category === 'string' && ALLOWED_CATEGORIES.has(record.category) ? record.category : 'partner',
      sortOrder: typeof record.sortOrder === 'number' ? record.sortOrder : 0,
      visible: typeof record.visible === 'boolean' ? record.visible : true,
    },
  });

  return NextResponse.json(partner, { status: 201 });
}
