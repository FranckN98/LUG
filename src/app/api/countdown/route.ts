import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  pickLocalized,
  type CountdownLocale,
  type CountdownPayload,
} from '@/lib/countdown';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseLocale(value: string | null): CountdownLocale {
  return value === 'fr' || value === 'de' ? value : 'en';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = parseLocale(url.searchParams.get('locale'));

  try {
    const row = await prisma.countdownConfig.findUnique({ where: { id: 'singleton' } });
    if (!row) {
      const payload: CountdownPayload = {
        isActive: false,
        targetDate: null,
        title: null,
        subtitle: null,
        endedMessage: null,
      };
      return NextResponse.json(payload);
    }

    const { title, subtitle, endedMessage } = pickLocalized(row, locale);
    const payload: CountdownPayload = {
      isActive: row.isActive,
      targetDate: row.targetDate.toISOString(),
      title,
      subtitle,
      endedMessage,
    };
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' },
    });
  } catch {
    const payload: CountdownPayload = {
      isActive: false,
      targetDate: null,
      title: null,
      subtitle: null,
      endedMessage: null,
    };
    return NextResponse.json(payload, { status: 200 });
  }
}
