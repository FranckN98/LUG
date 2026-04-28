import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

function isAdmin() {
  const cookieStore = cookies();
  return cookieStore.get('admin_session')?.value === 'authenticated';
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const config = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
  return NextResponse.json(config ?? { id: 'singleton' });
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  const data = {
    headerLogoUrl: body.headerLogoUrl ?? null,
    headerJoinLabelFr: body.headerJoinLabelFr ?? null,
    headerJoinLabelDe: body.headerJoinLabelDe ?? null,
    headerJoinLabelEn: body.headerJoinLabelEn ?? null,
    headerJoinLink: body.headerJoinLink ?? null,
    headerJoinOpenInNewTab: !!body.headerJoinOpenInNewTab,
    headerJoinColorVariant: body.headerJoinColorVariant ?? 'red',
    headerSponsorLabelFr: body.headerSponsorLabelFr ?? null,
    headerSponsorLabelDe: body.headerSponsorLabelDe ?? null,
    headerSponsorLabelEn: body.headerSponsorLabelEn ?? null,
    headerSponsorLink: body.headerSponsorLink ?? null,
    headerSponsorOpenInNewTab: !!body.headerSponsorOpenInNewTab,
    headerSponsorColorVariant: body.headerSponsorColorVariant ?? 'yellow',
    membershipHeroHeadingFr: body.membershipHeroHeadingFr ?? null,
    membershipHeroHeadingDe: body.membershipHeroHeadingDe ?? null,
    membershipHeroHeadingEn: body.membershipHeroHeadingEn ?? null,
    membershipHeroSubFr: body.membershipHeroSubFr ?? null,
    membershipHeroSubDe: body.membershipHeroSubDe ?? null,
    membershipHeroSubEn: body.membershipHeroSubEn ?? null,
    membershipHeroBgUrl: body.membershipHeroBgUrl ?? null,
  };

  const saved = await prisma.siteConfig.upsert({
    where: { id: 'singleton' },
    update: data,
    create: {
      id: 'singleton',
      ...data,
    },
  });

  return NextResponse.json(saved);
}
