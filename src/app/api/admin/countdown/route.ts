import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import type { CountdownAdminPayload } from '@/lib/countdown';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toAdminPayload(row: Awaited<ReturnType<typeof prisma.countdownConfig.findUnique>>): CountdownAdminPayload {
  if (!row) {
    return {
      isActive: false,
      hideHeroSubtitle: false,
      targetDate: null,
      titleFr: null, titleDe: null, titleEn: null,
      subtitleFr: null, subtitleDe: null, subtitleEn: null,
      endedMessageFr: null, endedMessageDe: null, endedMessageEn: null,
    };
  }
  return {
    isActive: row.isActive,
    hideHeroSubtitle: row.hideHeroSubtitle,
    targetDate: row.targetDate.toISOString(),
    titleFr: row.titleFr,
    titleDe: row.titleDe,
    titleEn: row.titleEn,
    subtitleFr: row.subtitleFr,
    subtitleDe: row.subtitleDe,
    subtitleEn: row.subtitleEn,
    endedMessageFr: row.endedMessageFr,
    endedMessageDe: row.endedMessageDe,
    endedMessageEn: row.endedMessageEn,
  };
}

export async function GET() {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const row = await prisma.countdownConfig.findUnique({ where: { id: 'singleton' } });
  return NextResponse.json(toAdminPayload(row));
}

export async function PATCH(req: Request) {
  const unauth = requireAdmin();
  if (unauth) return unauth;

  const body = (await req.json()) as Partial<CountdownAdminPayload>;

  // Validate the date strictly: anything we save must be parseable.
  if (!body.targetDate || typeof body.targetDate !== 'string') {
    return NextResponse.json({ error: 'targetDate is required' }, { status: 400 });
  }
  const parsed = new Date(body.targetDate);
  if (Number.isNaN(parsed.getTime())) {
    return NextResponse.json({ error: 'targetDate is invalid' }, { status: 400 });
  }

  const data = {
    isActive: !!body.isActive,
    hideHeroSubtitle: !!body.hideHeroSubtitle,
    targetDate: parsed,
    titleFr: body.titleFr?.trim() || null,
    titleDe: body.titleDe?.trim() || null,
    titleEn: body.titleEn?.trim() || null,
    subtitleFr: body.subtitleFr?.trim() || null,
    subtitleDe: body.subtitleDe?.trim() || null,
    subtitleEn: body.subtitleEn?.trim() || null,
    endedMessageFr: body.endedMessageFr?.trim() || null,
    endedMessageDe: body.endedMessageDe?.trim() || null,
    endedMessageEn: body.endedMessageEn?.trim() || null,
  };

  const saved = await prisma.countdownConfig.upsert({
    where: { id: 'singleton' },
    update: data,
    create: { id: 'singleton', ...data },
  });

  return NextResponse.json(toAdminPayload(saved));
}
