import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const docs = await prisma.sponsorDocument.findMany({
    where: { isPublic: true },
    orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      description: true,
      url: true,
      filename: true,
      size: true,
      isFeatured: true,
      createdAt: true,
    },
  });
  const featured = docs.find((d) => d.isFeatured) ?? null;
  return NextResponse.json({ featured, documents: docs });
}
