import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import EventsAdminList from './EventsAdminList';

type EventRecord = Prisma.EventGetPayload<{
  include: {
    translations: true;
    _count: {
      select: {
        scheduleItems: true;
        eventSpeakers: true;
        eventOrganizations: true;
        mediaItems: true;
        documents: true;
      };
    };
  };
}>;

export default async function AdminEventsPage() {
  let events: EventRecord[] = [];

  try {
    events = await prisma.event.findMany({
      orderBy: [{ year: 'desc' }],
      include: {
        translations: true,
        _count: {
          select: {
            scheduleItems: true,
            eventSpeakers: true,
            eventOrganizations: true,
            mediaItems: true,
            documents: true,
          },
        },
      },
    });
  } catch {
    // client not yet regenerated or DB not migrated
  }

  const published = events.filter((event) => event.status === 'published').length;
  const upcoming = events.filter((event) => event.status === 'upcoming' || event.status === 'tba').length;

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Événements</p>
          <h1 className="text-2xl font-bold text-white">Éditions & programmation</h1>
          <p className="mt-1 text-sm text-white/35">
            {published} publié{published !== 1 ? 's' : ''} · {upcoming} à venir · {events.length} total
          </p>
        </div>

        <Link
          href="/admin/events/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] hover:bg-[#a82020] transition focus:outline-none"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add event
        </Link>
      </div>

      <EventsAdminList
        events={events.map((event) => ({
          id: event.id,
          year: event.year,
          slug: event.slug,
          status: event.status,
          sortOrder: event.sortOrder,
          title:
            event.translations.find((translation) => translation.locale === 'fr')?.name ??
            event.translations.find((translation) => translation.locale === 'en')?.name ??
            `Level Up in Germany ${event.year}`,
          counts: event._count,
        }))}
      />
    </div>
  );
}
