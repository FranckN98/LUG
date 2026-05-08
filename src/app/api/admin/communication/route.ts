import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getCommunicationAdminData, normalizeCommunicationSettingsInput, saveCommunicationSettings } from '@/lib/event-communication';
import type { Locale } from '@/i18n/config';
import { requireAdmin } from '@/lib/adminAuth';

function normalizeLocale(locale: string | null): Locale {
  return locale === 'de' || locale === 'fr' || locale === 'en' ? locale : 'fr';
}

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const locale = normalizeLocale(req.nextUrl.searchParams.get('locale'));
  const data = await getCommunicationAdminData(locale);

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export async function PATCH(req: NextRequest) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const payload = normalizeCommunicationSettingsInput(await req.json());
    const saved = await saveCommunicationSettings(payload);

    return NextResponse.json(
      {
        id: saved.id,
        isCommunicationModeActive: saved.isCommunicationModeActive,
        popupDelaySeconds: saved.popupDelaySeconds,
        title: saved.title,
        description: saved.description,
        buttonText: saved.buttonText,
        eventId: saved.eventId,
        updatedAt: saved.updatedAt.toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    if (error instanceof Error && error.message === 'event_not_found') {
      return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Cette configuration existe déjà.' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Impossible de sauvegarder la configuration.' }, { status: 500 });
  }
}