import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const config = await prisma.ticketingConfig.findUnique({
    where: { id: 'singleton' },
    include: {
      passes: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return NextResponse.json(config ?? { id: 'singleton', passes: [] });
}

export async function PATCH(req: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

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
    translations: typeof body.translations === 'string'
      ? body.translations
      : JSON.stringify(body.translations ?? {}),
  };

  const saved = await prisma.ticketingConfig.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });

  return NextResponse.json(saved);
}
