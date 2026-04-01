import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { eventsCopy } from '@/content/events';
import type { EventEdition } from '@/content/events';
import { EventsTabs } from '@/components/EventsTabs';
import { getPublicEventGallery } from '@/lib/eventGallery';

export const dynamic = 'force-dynamic';

type Props = {
  locale: Locale;
  /** Si d\u00e9fini : une seule \u00e9dition (pages /events/levelup2025 | levelup2026). */
  focusEdition?: EventEdition;
};

export function EventsLanding({ locale, focusEdition }: Props) {
  const t = eventsCopy[locale];
  const base = `/${locale}`;
  const gallery2025FromDisk = getPublicEventGallery('2025');
  const gallery2026FromDisk = getPublicEventGallery('2026');

  const intro =
    focusEdition === '2025'
      ? t.introDedicated2025
      : focusEdition === '2026'
        ? t.introDedicated2026
        : t.intro;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(140,26,26,0.06),transparent)]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <header className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-accent mb-3">
            {t.eyebrow}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-bold text-brand-dark mb-4">
            {t.title}
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
            {intro}
          </p>
        </header>

        <EventsTabs
          locale={locale}
          gallery2025FromDisk={gallery2025FromDisk}
          gallery2026FromDisk={gallery2026FromDisk}
          focusEdition={focusEdition}
        />

        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <Link
            href={`${base}/events/archives`}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary hover:text-white hover:border-primary"
          >
            {t.archivesLink}
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
