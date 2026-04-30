import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { eventInclude, serializeEventForForm } from '@/lib/events-db';
import EventsAdminList from './EventsAdminList';

function pickAdminTitle(titleMap: ReturnType<typeof serializeEventForForm>['content']) {
  return titleMap.fr.title || titleMap.en.title || titleMap.de.title || 'Sans titre';
}

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: [{ year: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      ...eventInclude,
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

  const published = events.filter((event) => event.status === 'published').length;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent/70">Événements</p>
          <h1 className="text-2xl font-bold text-white">Éditions & programmation</h1>
          <p className="mt-1 text-sm text-white/35">{published} publié{published !== 1 ? 's' : ''} · {events.length - published} brouillon{events.length - published !== 1 ? 's' : ''}</p>
        </div>

        <Link href="/admin/events/new" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] transition hover:bg-[#a82020] focus:outline-none">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle édition
        </Link>
      </div>

      <EventsAdminList
        events={events.map((event) => ({
          id: event.id,
          title: pickAdminTitle(serializeEventForForm(event).content),
          slug: event.slug,
          year: event.year,
          status: event.status,
          sortOrder: event.sortOrder,
          counts: event._count,
        }))}
      />
    </div>
  );
}
