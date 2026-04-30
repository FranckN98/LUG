import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eventsCopy } from '@/content/events';
import type { Locale } from '@/i18n/config';
import { EditionContent } from '@/components/EventsTabs';
import { getEventBySlug, getEventHeadline, mapEventToEventData } from '@/lib/events-db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function normalizeLocale(locale: string): Locale {
  return locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en';
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const loc = normalizeLocale(locale);
  const event = await getEventBySlug(slug);

  const PUBLIC_STATUSES = ['published', 'upcoming', 'finished'];
  if (!event || !PUBLIC_STATUSES.includes(event.status)) {
    return {
      title: eventsCopy[loc].title,
      description: eventsCopy[loc].intro,
    };
  }

  const headline = getEventHeadline(event, loc);

  return {
    title: headline.title,
    description: headline.summary || eventsCopy[loc].intro,
  };
}

export default async function EventBySlugPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const loc = normalizeLocale(locale);
  const event = await getEventBySlug(slug);

  const PUBLIC_STATUSES = ['published', 'upcoming', 'finished'];
  if (!event || !PUBLIC_STATUSES.includes(event.status)) {
    notFound();
  }

  const t = eventsCopy[loc];
  const headline = getEventHeadline(event, loc);
  const data = mapEventToEventData(event, loc);
  const isEmpty = !data.gallery.length && !data.programme.length && !data.speakers.length && !data.tagline;

  return (
    <div className="overflow-hidden bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark text-white">
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_30%,rgba(233,140,11,0.22),transparent_50%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_80%,rgba(140,26,26,0.5),transparent_45%)]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-24 sm:px-6 sm:pb-16 sm:pt-28">
            <Link href={`/${loc}/events`} className="inline-flex items-center gap-2 text-sm font-semibold text-accent-light transition hover:text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToEvents}
          </Link>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-accent">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">{headline.title}</h1>
          {headline.summary ? <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">{headline.summary}</p> : null}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <EditionContent
          data={data}
          t={t}
          locale={loc}
          isEmpty={isEmpty}
          galleryMasonry={false}
          edition={String(event.year)}
        />
      </section>
    </div>
  );
}
