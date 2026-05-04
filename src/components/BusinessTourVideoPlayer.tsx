'use client';

import React, { useState } from 'react';
import type { Locale } from '@/i18n/config';

type Props = {
  videoId: string;
  locale: Locale;
  /** Optional poster URL. Defaults to YouTube's maxresdefault thumbnail. */
  posterUrl?: string;
  /** Accessible title for the iframe */
  title?: string;
};

const labels: Record<Locale, { aria: string; cta: string }> = {
  de: { aria: 'Video abspielen', cta: 'Video ansehen' },
  en: { aria: 'Play video', cta: 'Watch the story' },
  fr: { aria: 'Lire la vidéo', cta: 'Voir la vidéo' },
};

/**
 * Premium inline YouTube facade.
 * - Shows a high-res poster + animated play button (lazy-loads zero JS until clicked).
 * - On click, swaps the poster for the actual iframe with autoplay (user-initiated → allowed).
 * - Uses youtube-nocookie for privacy.
 */
export function BusinessTourVideoPlayer({ videoId, locale, posterUrl, title }: Props) {
  const [playing, setPlaying] = useState(false);
  const t = labels[locale] ?? labels.en;
  const poster = posterUrl ?? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const embedSrc =
    `https://www.youtube-nocookie.com/embed/${videoId}` +
    `?autoplay=1&rel=0&modestbranding=1&playsinline=1&color=white`;

  return (
    <div className="relative">
      {/* Outer ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-[28px] bg-gradient-to-br from-accent/25 via-primary/10 to-transparent blur-2xl"
      />
      {/* Card */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-white/10 bg-white/[0.04] p-2 sm:p-3 shadow-[0_30px_120px_-30px_rgba(233,140,11,0.45)] backdrop-blur-sm">
        <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-black aspect-video">
          {playing ? (
            <iframe
              src={embedSrc}
              title={title ?? 'Level Up Business Tour'}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={t.aria}
              className="group absolute inset-0 flex items-center justify-center focus:outline-none"
            >
              {/* Poster */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={poster}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                onError={(e) => {
                  // Fallback to standard hqdefault if maxresdefault is missing
                  const img = e.currentTarget;
                  if (!img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                  }
                }}
              />
              {/* Darken */}
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/30 transition-opacity duration-300 group-hover:opacity-90"
              />

              {/* Premium animated play disc */}
              <span className="relative inline-flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark text-black shadow-[0_10px_40px_-8px_rgba(233,140,11,0.65)] ring-1 ring-white/30 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-105">
                {/* Outer halo */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-full bg-accent/45 motion-safe:animate-ping [animation-duration:2.4s]"
                />
                {/* Layered halo */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 rounded-full bg-accent/25 motion-safe:animate-ping [animation-duration:2.4s] [animation-delay:1.1s]"
                />
                {/* Soft glow */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-3 rounded-full bg-accent/30 blur-xl opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                />
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                  className="relative z-[1] h-8 w-8 sm:h-10 sm:w-10 translate-x-[2px] drop-shadow"
                >
                  <path d="M8 5.5v13a1 1 0 0 0 1.54.84l10-6.5a1 1 0 0 0 0-1.68l-10-6.5A1 1 0 0 0 8 5.5Z" />
                </svg>
              </span>

              {/* CTA label */}
              <span className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-4 py-1.5 text-xs sm:text-sm font-medium uppercase tracking-[0.22em] text-white/90 backdrop-blur-sm">
                {t.cta}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
