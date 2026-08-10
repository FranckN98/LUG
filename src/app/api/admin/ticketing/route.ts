import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function isAdmin() {
  const cookieStore = cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await prisma.ticketingConfig.findUnique({
    where: { id: 'singleton' },
    include: {
      passes: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return NextResponse.json(config ?? { id: 'singleton', passes: [] });
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const data = {
    isNewTicketingActive: !!body.isNewTicketingActive,
    ticketingProvider: body.ticketingProvider === 'weezevent' ? 'weezevent' : 'tailor',
    pageTitle: body.pageTitle ?? 'Level Up in Germany 2026',
    pageSubtitle: body.pageSubtitle ?? 'Une journée pour accélérer votre avenir en Allemagne.',
    pageIntro: body.pageIntro ?? '',
    eventDate: body.eventDate ?? '17 octobre 2026',
    eventLocation: body.eventLocation ?? 'Francfort',
    ctaButtonText: body.ctaButtonText ?? 'Choisir mon billet',
    checkoutUrl: body.checkoutUrl ?? '',
    weezeventUrl: body.weezeventUrl ?? '',
    videoUrl: body.videoUrl ?? '',
    parkingLocations: typeof body.parkingLocations === 'string' ? body.parkingLocations : '[]',
  };

  const saved = await prisma.ticketingConfig.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });

  return NextResponse.json(saved);
}
