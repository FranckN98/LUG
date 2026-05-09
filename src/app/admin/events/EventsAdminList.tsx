'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminNotify } from '@/app/admin/components/AdminToaster';

type EventRow = {
  id: string;
  title: string;
  slug: string;
  year: number;
  status: string;
  sortOrder: number;
  counts: {
    scheduleItems: number;
    eventSpeakers: number;
    eventOrganizations: number;
    mediaItems: number;
    documents: number;
  };
};

export default function EventsAdminList({ events }: { events: EventRow[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [orderedEvents, setOrderedEvents] = useState<EventRow[]>(events);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  useEffect(() => {
    setOrderedEvents(events);
  }, [events]);

  async function patchStatus(id: string, status: string) {
    setPendingId(id);
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        adminNotify.success('Statut de l’événement mis à jour.');
        router.refresh();
      } else {
        adminNotify.error('Mise à jour du statut impossible.');
      }
    } finally {
      setPendingId(null);
    }
  }

  async function deleteEvent(id: string) {
    if (!window.confirm('Supprimer cette édition et tous ses éléments ?')) return;
    setPendingId(id);
    try {
      const response = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      if (response.ok) {
        adminNotify.success('Événement supprimé.');
        router.refresh();
      } else {
        adminNotify.error('Suppression impossible.');
      }
    } finally {
      setPendingId(null);
    }
  }

  function moveItem(list: EventRow[], fromIndex: number, toIndex: number) {
    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    return next.map((event, index) => ({
      ...event,
      sortOrder: index,
    }));
  }

  async function persistOrder(previous: EventRow[], next: EventRow[]) {
    const changed = next.filter((item, index) => {
      const prev = previous.find((p) => p.id === item.id);
      return !prev || prev.sortOrder !== item.sortOrder;
    });

    if (!changed.length) return;

    setPendingId('__reorder__');
    try {
      await Promise.all(
        changed.map((item) =>
          fetch(`/api/admin/events/${item.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: item.sortOrder }),
          }),
        ),
      );
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handleDrop(targetId: string) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setOverId(null);
      return;
    }

    const fromIndex = orderedEvents.findIndex((item) => item.id === draggedId);
    const toIndex = orderedEvents.findIndex((item) => item.id === targetId);

    if (fromIndex < 0 || toIndex < 0) {
      setDraggedId(null);
      setOverId(null);
      return;
    }

    const previous = orderedEvents;
    const next = moveItem(orderedEvents, fromIndex, toIndex);

    setOrderedEvents(next);
    setDraggedId(null);
    setOverId(null);
    await persistOrder(previous, next);
  }

  if (!events.length) {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/45">Aucune édition enregistrée pour le moment.</div>;
  }

  return (
    <div className="space-y-4">
      {orderedEvents.map((event) => {
        const busy = pendingId === event.id;
        return (
          <article
            key={event.id}
            onDragOver={(e) => {
              e.preventDefault();
              setOverId(event.id);
            }}
            onDragLeave={() => setOverId((current) => (current === event.id ? null : current))}
            onDrop={(e) => {
              e.preventDefault();
              void handleDrop(event.id);
            }}
            className={`rounded-2xl border bg-white/[0.04] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition ${
              overId === event.id ? 'border-primary/40 ring-1 ring-primary/30' : 'border-white/10'
            }`}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    draggable
                    onDragStart={() => setDraggedId(event.id)}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setOverId(null);
                    }}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/15 text-white/60 hover:border-primary/40 hover:text-white cursor-grab active:cursor-grabbing"
                    title="Glisser pour réordonner"
                    aria-label="Glisser pour réordonner"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                      <path d="M7 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM13 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm0 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
                    </svg>
                  </button>
                  <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{event.year}</span>
                  <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">{event.status}</span>
                  <span className="inline-flex rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/50">Ordre {event.sortOrder}</span>
                </div>
                <h2 className="mt-3 text-lg font-semibold text-white">{event.title}</h2>
                <p className="mt-1 text-sm text-white/35">/{event.slug}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/45">
                  <span className="rounded-full border border-white/10 px-3 py-1">Programme {event.counts.scheduleItems}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Speakers {event.counts.eventSpeakers}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Partenaires {event.counts.eventOrganizations}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Galerie {event.counts.mediaItems}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1">Docs {event.counts.documents}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <Link href={`/admin/events/${event.id}/edit`} className="inline-flex items-center rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/5">Éditer</Link>
                <button type="button" disabled={busy} onClick={() => patchStatus(event.id, event.status === 'published' ? 'draft' : 'published')} className="inline-flex items-center rounded-xl border border-primary/20 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-50">
                  {event.status === 'published' || event.status === 'finished' ? 'Archiver' : 'Publier'}
                </button>
                <button type="button" disabled={busy} onClick={() => deleteEvent(event.id)} className="inline-flex items-center rounded-xl border border-red-500/20 px-3 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10 disabled:opacity-50">
                  Supprimer
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
