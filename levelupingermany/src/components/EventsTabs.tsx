'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { eventsCopy } from '@/content/events';
import type { EventData, EventEdition } from '@/content/events';
import { ImageLightbox } from '@/components/ImageLightbox';
import { EventPdfDownloadCta } from '@/components/EventPdfDownloadCta';

function IconCalendar() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconClock({ className = 'h-5 w-5 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const SPEAKERS_PREVIEW_COUNT = 6;

function SpeakerCard({ name, role, domain }: { name: string; role: string; domain: string }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 text-primary font-bold text-lg ring-1 ring-black/5">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-brand-dark">{name}</h4>
          <p className="text-sm text-primary font-medium">{role}</p>
          {domain ? <p className="mt-0.5 text-xs text-gray-500">{domain}</p> : null}
        </div>
      </div>
    </div>
  );
}

function EventHero({ data, t }: { data: EventData; t: (typeof eventsCopy)[Locale] }) {
  if (!data.tagline && !data.theme) return null;
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-[#2a1212] via-primary to-[#4a1515] p-6 sm:p-8 text-white shadow-xl shadow-primary/20">
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="relative">
        {data.theme && (
          <p className="text-lg sm:text-xl font-semibold tracking-tight text-white drop-shadow-sm">
            {data.theme}
          </p>
        )}
        {data.tagline && (
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] text-accent-light/95 ${data.theme ? 'mt-2' : ''}`}>
            {data.tagline}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {data.date && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <IconCalendar />
              {data.date}
            </span>
          )}
          {data.timeRange && (
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <IconClock />
              {data.timeRange}
            </span>
          )}
          {data.price && data.showPrice !== false && !data.priceBlurred && (
            <span className="inline-flex items-center rounded-full bg-accent px-4 py-2 text-sm font-bold text-brand-dark">
              {t.sections.price}: {data.price}
            </span>
          )}
          {data.priceBlurred && (
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-brand-dark shadow-inner ring-1 ring-black/10">
              <span className="shrink-0">{t.sections.price}:</span>
              <span className="relative inline-flex min-w-[3.25rem] overflow-hidden rounded-md">
                <span
                  className="inline-block select-none blur-[9px] scale-125 opacity-80"
                  aria-hidden
                >
                  {data.price ?? '—'}
                </span>
              </span>
              <span className="sr-only">{t.priceBlurredAria}</span>
            </span>
          )}
        </div>
        {data.audience && (
          <p className="mt-4 text-sm text-white/85 max-w-2xl leading-relaxed">
            <span className="font-semibold text-accent-light/95">{t.sections.audience}: </span>
            {data.audience}
          </p>
        )}
      </div>
    </div>
  );
}

const GALLERY_PAGE_SIZE = 12;

function formatGalleryPageInfo(template: string, current: number, total: number) {
  return template.replace('{current}', String(current)).replace('{total}', String(total));
}

function GalleryGrid({
  paths,
  masonry,
  locale,
}: {
  paths: string[];
  masonry?: boolean;
  locale: Locale;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const t = eventsCopy[locale];
  const labels = t.sections;

  const pathsKey = paths.join('\0');
  useEffect(() => {
    setPage(0);
  }, [pathsKey]);

  const totalPages = Math.max(1, Math.ceil(paths.length / GALLERY_PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pagePaths = paths.slice(safePage * GALLERY_PAGE_SIZE, (safePage + 1) * GALLERY_PAGE_SIZE);
  const showPagination = paths.length > GALLERY_PAGE_SIZE;

  const galleryImg = (src: string, className: string) => (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      className={className}
      loading="lazy"
      decoding="async"
    />
  );

  const wrapClickable = (
    key: string | number,
    src: string,
    children: React.ReactNode,
    layoutClass: string
  ) => (
    <button
      key={key}
      type="button"
      onClick={() => setSelected(src)}
      className={`${layoutClass} cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
    >
      {children}
    </button>
  );

  const paginationBar =
    showPagination ? (
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={safePage <= 0}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-primary/40 hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {labels.galleryPrev}
        </button>
        <span className="text-sm text-gray-600 tabular-nums">
          {formatGalleryPageInfo(labels.galleryPageInfo, safePage + 1, totalPages)}
        </span>
        <button
          type="button"
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          disabled={safePage >= totalPages - 1}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-primary/40 hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {labels.galleryNext}
        </button>
      </div>
    ) : null;

  if (masonry) {
    return (
      <>
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>div]:mb-4">
          {pagePaths.map((src, i) =>
            wrapClickable(
              `${src}-${safePage}-${i}`,
              src,
              <div className="break-inside-avoid overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-md ring-1 ring-black/[0.04] transition duration-300 hover:shadow-xl hover:ring-primary/15">
                <div className="overflow-hidden bg-gray-100">
                  {galleryImg(
                    src,
                    'w-full h-auto min-h-[120px] object-cover transition duration-500 hover:scale-[1.02]',
                  )}
                </div>
              </div>,
              'block w-full text-left'
            )
          )}
        </div>
        {paginationBar}
        <ImageLightbox
          src={selected}
          gallery={paths}
          onChangeSrc={setSelected}
          onClose={() => setSelected(null)}
          navLabels={{ prev: labels.galleryPrev, next: labels.galleryNext }}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {pagePaths.map((src, i) =>
          wrapClickable(
            `${src}-${safePage}-${i}`,
            src,
            <div className="group aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 shadow-sm transition-all duration-300 hover:shadow-lg">
              {galleryImg(
                src,
                'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
              )}
            </div>,
            'block w-full text-left'
          )
        )}
      </div>
      {paginationBar}
      <ImageLightbox
        src={selected}
        gallery={paths}
        onChangeSrc={setSelected}
        onClose={() => setSelected(null)}
        navLabels={{ prev: labels.galleryPrev, next: labels.galleryNext }}
      />
    </>
  );
}

function EditionContent({
  data,
  t,
  locale,
  isEmpty,
  galleryMasonry,
  edition,
}: {
  data: EventData;
  t: (typeof eventsCopy)[Locale];
  locale: Locale;
  isEmpty: boolean;
  galleryMasonry?: boolean;
  edition: EventEdition;
}) {
  const [speakersExpanded, setSpeakersExpanded] = useState(false);

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 py-16 text-center">
        <p className="text-gray-500 font-medium">{t.sections.comingSoon}</p>
        <p className="mt-2 text-sm text-gray-400 max-w-md mx-auto">
          {locale === 'de' && 'Die Struktur für diese Edition ist bereit. Der Inhalt folgt in Kürze.'}
          {locale === 'en' && 'The structure for this edition is ready. Content will follow shortly.'}
          {locale === 'fr' && "La structure de cette édition est prête. Le contenu suivra prochainement."}
        </p>
      </div>
    );
  }

  const hasBlocks = Boolean(data.programmeBlocks?.length);
  const hasFlat = Boolean(data.programme.length);
  const showMetaRow =
    Boolean(data.tagline) ||
    hasBlocks ||
    hasFlat ||
    data.speakers.length > 0 ||
    (data.date && data.date !== '—' && data.date !== '-') ||
    (data.venue?.name && data.venue.name !== '—' && data.venue.name !== '-');

  return (
    <div className="space-y-12 animate-tab-fade-in">
      <EventHero data={data} t={t} />

      {data.highlights && data.highlights.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-primary mb-4">{t.sections.highlights}</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {data.highlights.map((h, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-accent/25 card-hover-lift"
              >
                <p className="font-semibold text-brand-dark">{h.title}</p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{h.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Programme */}
      {(hasBlocks || hasFlat) && (
        <section>
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <IconCalendar />
            {t.sections.programme}
          </h3>

          {hasBlocks &&
            data.programmeBlocks!.map((block, bi) => (
              <div key={bi} className={bi > 0 ? 'mt-10' : ''}>
                <h4 className="text-sm font-bold uppercase tracking-wider text-accent mb-4 pl-1 border-l-4 border-accent pl-3">
                  {block.heading}
                </h4>
                <div className="relative">
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-accent/40 via-primary/30 to-transparent" />
                  <ul className="space-y-3">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex gap-4 pl-10 relative">
                        <span className="absolute left-0 top-1 flex min-w-[3.25rem] justify-center rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                          {item.time}
                        </span>
                        <div className="rounded-xl border border-gray-100 bg-white/90 px-4 py-3 shadow-sm flex-1">
                          <p className="font-medium text-brand-dark">{item.title}</p>
                          {item.desc && <p className="mt-1 text-sm text-gray-600 leading-relaxed">{item.desc}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

          {!hasBlocks && hasFlat && (
            <div className="relative">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-accent/40 via-primary/30 to-transparent" />
              <ul className="space-y-4">
                {data.programme.map((item, i) => (
                  <li key={i} className="flex gap-4 pl-10 relative">
                    <span className="absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {item.time}
                    </span>
                    <div className="rounded-xl border border-gray-100 bg-white/80 px-4 py-3 shadow-sm flex-1">
                      <p className="font-medium text-brand-dark">{item.title}</p>
                      {item.desc && <p className="mt-0.5 text-sm text-gray-600">{item.desc}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {data.speakers.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-primary mb-4">{t.sections.speakers}</h3>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {(speakersExpanded ? data.speakers : data.speakers.slice(0, SPEAKERS_PREVIEW_COUNT)).map((s, i) => (
              <SpeakerCard key={`${s.name}-${i}`} name={s.name} role={s.role} domain={s.domain} />
            ))}
          </div>
          {data.speakers.length > SPEAKERS_PREVIEW_COUNT && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setSpeakersExpanded((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border-2 border-primary/25 bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition hover:border-accent hover:bg-accent/5 hover:shadow-md"
              >
                {speakersExpanded ? t.speakersSeeLess : t.speakersSeeMore}
                <svg
                  className={`h-4 w-4 transition-transform ${speakersExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </section>
      )}

      {showMetaRow && (
        <div className="grid lg:grid-cols-3 gap-4">
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">{t.sections.date}</h3>
            <p className="text-xl font-bold text-brand-dark">{data.date}</p>
            {data.timeRange && (
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <IconClock className="h-5 w-5 shrink-0 text-accent" />
                {data.timeRange}
              </p>
            )}
            {data.price && data.showPrice !== false && !data.priceBlurred && (
              <p className="mt-2 text-sm font-semibold text-primary">
                {t.sections.price}: {data.price}
              </p>
            )}
            {data.priceBlurred && (
              <p className="mt-2 flex flex-wrap items-center gap-x-2 text-sm font-semibold text-primary">
                <span>{t.sections.price}:</span>
                <span className="inline-flex overflow-hidden rounded align-middle">
                  <span className="inline-block select-none blur-[8px] scale-110 opacity-75" aria-hidden>
                    {data.price ?? '—'}
                  </span>
                </span>
                <span className="sr-only">{t.priceBlurredAria}</span>
              </p>
            )}
          </section>
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-3 flex items-center gap-2">
              <IconMapPin />
              {t.sections.venue}
            </h3>
            <p className="font-medium text-brand-dark">{data.venue.name}</p>
            <p className="text-sm text-gray-600 mt-1">{data.venue.address}</p>
            <p className="text-sm text-gray-600">{data.venue.city}</p>
            {data.venue.room && <p className="text-sm text-gray-500 mt-2">{data.venue.room}</p>}
          </section>
          {data.contact && (data.contact.email || data.contact.phone || data.contact.instagram) && (
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-accent mb-3">{t.sections.contact}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                {data.contact.email && (
                  <li>
                    <a href={`mailto:${data.contact.email}`} className="font-medium text-primary hover:underline">
                      {data.contact.email}
                    </a>
                  </li>
                )}
                {data.contact.phone && (
                  <li>
                    <a href={`tel:${data.contact.phone.replace(/\s/g, '')}`} className="hover:text-primary">
                      {data.contact.phone}
                    </a>
                  </li>
                )}
                {data.contact.instagram && <li className="text-gray-600">Instagram · {data.contact.instagram}</li>}
              </ul>
            </section>
          )}
        </div>
      )}

      {data.partners && data.partners.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-primary mb-4">{t.sections.partners}</h3>
          <div className="flex flex-wrap gap-2">
            {data.partners.map((p) => (
              <span
                key={p}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-accent/40 hover:bg-accent/5"
              >
                {p}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.gallery.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-primary mb-2">{t.sections.gallery}</h3>
          {data.galleryIntro && <p className="text-sm text-gray-600 mb-6 max-w-3xl leading-relaxed">{data.galleryIntro}</p>}
          <GalleryGrid paths={data.gallery} masonry={galleryMasonry} locale={locale} />
        </section>
      )}

      {data.videos.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold text-primary mb-4">{t.sections.videos}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.videos.map((v, i) => (
              <a
                key={i}
                href={`https://www.youtube.com/watch?v=${v.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <div className="relative aspect-video bg-gray-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg">
                      <svg className="ml-1 h-7 w-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className="p-3 font-medium text-brand-dark group-hover:text-primary transition-colors">{v.title}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {data.firstEditionBookUrl && (
        <EventPdfDownloadCta
          locale={locale}
          edition={edition}
          title={t.downloadBookTitle}
          subtitle={t.downloadBookSubtitle}
          t={t}
        />
      )}
    </div>
  );
}

type Props = {
  locale: Locale;
  /** Chemins lus sur le serveur depuis public/events/2025/ (prioritaires sur la liste du code). */
  gallery2025FromDisk?: string[];
  /** Idem public/events/2026/ */
  gallery2026FromDisk?: string[];
  /** Page d\u00e9di\u00e9e : une seule \u00e9dition (URLs /events/levelup2025 | levelup2026). */
  focusEdition?: EventEdition;
};

function mergeGallery(disk: string[] | undefined, fallback: string[]): string[] {
  if (disk && disk.length > 0) return disk;
  return fallback;
}

export function EventsTabs({ locale, gallery2025FromDisk, gallery2026FromDisk, focusEdition }: Props) {
  /** \u00c9dition affich\u00e9e par d\u00e9faut sur /events : 2026. */
  const [tabActive, setTabActive] = useState<EventEdition>('2026');
  const active = focusEdition ?? tabActive;
  /** Surcharge après fetch API (meme liste disque, utile si les props SSR etaient vides). */
  const [apiGallery2025, setApiGallery2025] = useState<string[] | null>(null);
  const [apiGallery2026, setApiGallery2026] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [r5, r6] = await Promise.all([
          fetch('/api/events/gallery/2025'),
          fetch('/api/events/gallery/2026'),
        ]);
        const j5 = (await r5.json()) as { urls?: string[] };
        const j6 = (await r6.json()) as { urls?: string[] };
        if (cancelled) return;
        if (Array.isArray(j5.urls) && j5.urls.length > 0) setApiGallery2025(j5.urls);
        if (Array.isArray(j6.urls) && j6.urls.length > 0) setApiGallery2026(j6.urls);
      } catch {
        /* ignore */
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const t = eventsCopy[locale];
  const data2025 = useMemo(() => {
    const base = eventsCopy[locale].edition2025;
    const fromProps = mergeGallery(gallery2025FromDisk, base.gallery);
    const gallery =
      apiGallery2025 && apiGallery2025.length > 0 ? apiGallery2025 : fromProps;
    return { ...base, gallery };
  }, [locale, gallery2025FromDisk, apiGallery2025]);
  const data2026 = useMemo(() => {
    const base = eventsCopy[locale].edition2026;
    const fromProps = mergeGallery(gallery2026FromDisk, base.gallery);
    const gallery =
      apiGallery2026 && apiGallery2026.length > 0 ? apiGallery2026 : fromProps;
    return { ...base, gallery };
  }, [locale, gallery2026FromDisk, apiGallery2026]);

  const isEmpty2026 =
    !data2026.gallery?.length && !data2026.programme?.length && !data2026.speakers?.length && !data2026.tagline;

  return (
    <div className="space-y-8">
      {!focusEdition && (
        <div
          role="tablist"
          aria-label={t.title}
          className="flex flex-col sm:flex-row gap-2 p-1.5 rounded-2xl bg-white/80 border border-gray-100 shadow-sm max-w-2xl mx-auto"
        >
          <button
            type="button"
            role="tab"
            aria-selected={active === '2026'}
            aria-controls="panel-2026"
            id="tab-2026"
            onClick={() => setTabActive('2026')}
            className={`flex-1 rounded-xl px-6 py-4 font-semibold text-center transition-all duration-300 ${
              active === '2026'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
            }`}
          >
            {t.tab2026}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={active === '2025'}
            aria-controls="panel-2025"
            id="tab-2025"
            onClick={() => setTabActive('2025')}
            className={`flex-1 rounded-xl px-6 py-4 font-semibold text-center transition-all duration-300 ${
              active === '2025'
                ? 'bg-primary text-white shadow-md shadow-primary/25'
                : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
            }`}
          >
            {t.tab2025}
          </button>
        </div>
      )}

      <div className="min-h-[320px]">
        <div
          role="tabpanel"
          id="panel-2026"
          aria-labelledby="tab-2026"
          hidden={active !== '2026'}
          className={active !== '2026' ? 'hidden' : ''}
        >
          <EditionContent
            data={data2026}
            t={t}
            locale={locale}
            isEmpty={isEmpty2026}
            galleryMasonry={false}
            edition="2026"
          />
        </div>
        <div
          role="tabpanel"
          id="panel-2025"
          aria-labelledby="tab-2025"
          hidden={active !== '2025'}
          className={active !== '2025' ? 'hidden' : ''}
        >
          <EditionContent data={data2025} t={t} locale={locale} isEmpty={false} galleryMasonry={false} edition="2025" />
        </div>
      </div>
    </div>
  );
}
