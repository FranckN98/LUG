import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';
import { getPublishedEvents, mapEventToArchiveCard } from '@/lib/events-db';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/events/archives');
}

const content: Record<Locale, { title: string; intro: string; openEdition: string; keyLinks: string; empty: string }> = {
  de: { title: 'Event-Archive', intro: 'Vergangene Events nach Jahr mit Berichten, Fotos und Ressourcen.', openEdition: 'Edition öffnen', keyLinks: 'Schlüssel-Links', empty: 'Noch keine veröffentlichten Archive.' },
  en: { title: 'Event Archives', intro: 'Past events by year with reports, photos and resources.', openEdition: 'Open edition', keyLinks: 'Key links', empty: 'No published archives yet.' },
  fr: { title: 'Archives des événements', intro: 'Événements passés par année avec infos clés, rapports, photos et ressources.', openEdition: 'Ouvrir l’édition', keyLinks: 'Liens clés', empty: 'Aucune archive publiée pour le moment.' },
};

export default async function EventsArchivesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];
  const events = (await getPublishedEvents().catch(() => [])).map((event) => mapEventToArchiveCard(event, loc));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t.title}</h1>
      <p className="text-gray-600 mb-6">{t.intro}</p>

      {!events.length ? (
        <p className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-600">{t.empty}</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const editionHref = `/${loc}/events/${event.slug}`;

            return (
              <article key={event.id} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">{event.year}</span>
                      <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{event.dateLabel || event.year}</span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-brand-dark">{event.title}</h2>
                    {event.archiveSummary && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{event.archiveSummary}</p>}
                    <p className="mt-3 text-sm text-gray-500">{[event.venueName, event.venueCity].filter(Boolean).join(' · ')}</p>
                  </div>

                  <Link href={editionHref} className="inline-flex items-center rounded-full border border-primary/20 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white">
                    {t.openEdition}
                  </Link>
                </div>

                {event.documents.length > 0 && (
                  <div className="mt-5 border-t border-gray-200 pt-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gray-500">{t.keyLinks}</p>
                    <div className="flex flex-wrap gap-2">
                      {event.documents.map((document) => (
                        <a
                          key={document.id}
                          href={document.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                        >
                          {document.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
