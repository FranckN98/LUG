import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const search = searchParams.get('search')?.trim() || '';

  const where: Record<string, unknown> = {};
  if (status) where.applicationStatus = status;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { activityDomain: { contains: search, mode: 'insensitive' } },
    ];
  }

  const members = await prisma.member.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      birthDate: true,
      address: true,
      activityDomain: true,
      motivation: true,
      helpDomains: true,
      applicationStatus: true,
      rejectionReason: true,
      membershipFeePaid: true,
      lastPaymentDate: true,
      createdAt: true,
    },
  });

  return NextResponse.json(members);
}
