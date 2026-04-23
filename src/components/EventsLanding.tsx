import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { eventsCopy } from '@/content/events';
import type { EventEdition } from '@/content/events';
import { EventsTabs } from '@/components/EventsTabs';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { getPublicEventGallery } from '@/lib/eventGallery';
import { getLandingEvents, mapEventToEventData } from '@/lib/events-db';

export const dynamic = 'force-dynamic';

type Props = {
  locale: Locale;
  focusEdition?: EventEdition;
};

export async function EventsLanding({ locale, focusEdition }: Props) {
  const t = eventsCopy[locale];
  const base = `/${locale}`;
  const gallery2025FromDisk = getPublicEventGallery('2025');
  const gallery2026FromDisk = getPublicEventGallery('2026');
  const landingEvents = await getLandingEvents().catch(() => []);
  const event2025 = landingEvents.find((event) => event.year === 2025);
  const event2026 = landingEvents.find((event) => event.year === 2026);

  const intro =
    focusEdition === '2025'
      ? t.introDedicated2025
      : focusEdition === '2026'
        ? t.introDedicated2026
        : t.intro;

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_30%,rgba(233,140,11,0.22),transparent_50%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_80%,rgba(140,26,26,0.5),transparent_45%)]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Decorative year */}
        <span
          className="pointer-events-none select-none absolute right-4 bottom-0 text-[8rem] sm:text-[13rem] font-black leading-none text-white/[0.04] tracking-tighter"
          aria-hidden
        >
          {focusEdition ?? '2026'}
        </span>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20 pt-24 sm:pt-28 w-full">
          <RevealOnScroll>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-accent mb-4">
              {t.eyebrow}
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-display leading-[1.02] max-w-3xl">
              {t.title}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/65 max-w-xl leading-relaxed">
              {intro}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="relative bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <EventsTabs
            locale={locale}
            gallery2025FromDisk={gallery2025FromDisk}
            gallery2026FromDisk={gallery2026FromDisk}
            focusEdition={focusEdition}
            event2025Data={event2025 ? mapEventToEventData(event2025, locale) : undefined}
            event2026Data={event2026 ? mapEventToEventData(event2026, locale) : undefined}
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
      </section>

    </div>
  );
}
