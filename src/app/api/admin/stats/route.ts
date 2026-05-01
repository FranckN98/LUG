import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDefaultStats } from '@/lib/siteStats';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = url.searchParams.get('page');
  await ensureDefaultStats();
  const stats = await prisma.siteStat.findMany({
    where: page ? { page } : undefined,
    orderBy: [{ page: 'asc' }, { displayOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(stats);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    page,
    labelDe,
    labelEn,
    labelFr,
    valueNumber,
    suffix,
    valueText,
    displayOrder,
    isActive,
  } = body ?? {};

  if (!page || (page !== 'home' && page !== 'blog')) {
    return NextResponse.json({ error: 'Page invalide (home|blog).' }, { status: 400 });
  }
  if (!labelEn?.trim()) {
    return NextResponse.json({ error: 'Le libellé EN est requis.' }, { status: 400 });
  }

  const stat = await prisma.siteStat.create({
    data: {
      page,
      labelDe: labelDe ?? labelEn,
      labelEn,
      labelFr: labelFr ?? labelEn,
      valueNumber: typeof valueNumber === 'number' ? valueNumber : (valueNumber ? Number(valueNumber) : null),
      suffix: suffix ?? '',
      valueText: valueText ?? null,
      displayOrder: typeof displayOrder === 'number' ? displayOrder : 0,
      isActive: isActive ?? true,
    },
  });
  return NextResponse.json(stat, { status: 201 });
}
