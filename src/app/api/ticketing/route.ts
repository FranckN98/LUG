import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const config = await prisma.ticketingConfig.findUnique({
    where: { id: 'singleton' },
    include: {
      passes: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  return NextResponse.json(config ?? null);
}
