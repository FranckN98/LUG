import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status')?.trim() || '';
  const search = searchParams.get('search')?.trim() || '';

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { brandName: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ];
  }

  const items = await prisma.boothReservation.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(items);
}
