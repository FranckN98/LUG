'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_HERO_IMAGES } from '@/lib/heroDefaults';

interface HeroCarouselProps {
  title?: string;
  tagline?: string;
  subtitle?: string;
  autoplayInterval?: number;
  primaryButton?: { label: string; href: string; colorVariant?: string };
  buttons?: { label: string; href: string; colorVariant?: string; openInNewTab?: boolean }[];
  stats?: { value: number; suffix: string; label: string }[];
  images?: string[];
}

function AnimatedHeroTitle({ title }: { title: string }) {
  return (
    <span className="hero-typewriter" aria-label={title}>
      {title}
    </span>
  );
}

// ── Button color variants (hero dark background context) ──────────────────────
const BASE_BTN = 'group inline-flex items-center justify-center flex-1 sm:flex-none sm:w-auto h-11 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-full font-semibold hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 text-xs sm:text-base';

function heroBtnCls(variant: string): string {
  switch (variant) {
    case 'yellow':
      return `${BASE_BTN} bg-accent text-white shadow-[0_4px_20px_rgba(233,140,11,0.30)] hover:bg-[#f5a020] hover:shadow-[0_6px_28px_rgba(233,140,11,0.45)]`;
    case 'white':
      return `${BASE_BTN} bg-white/[0.12] text-white backdrop-blur-md border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white/95 hover:text-[#0f0606]`;
    case 'black':
      return `${BASE_BTN} bg-[#0f0606]/80 text-white border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:bg-[#0f0606]`;
    case 'outline-white':
      return `${BASE_BTN} bg-transparent text-white border-2 border-white hover:bg-white hover:text-[#0f0606]`;
    case 'outline-red':
      return `${BASE_BTN} bg-transparent text-white border-2 border-[#8c1a1a] hover:bg-[#8c1a1a]`;
    case 'red':
    default:
      return `${BASE_BTN} bg-primary text-white shadow-[0_4px_20px_rgba(140,26,26,0.35)] hover:bg-primary-light hover:shadow-[0_6px_28px_rgba(140,26,26,0.45)] gap-2`;
  }
}

export default function HeroCarousel({
  title,
  tagline,
  subtitle,
  autoplayInterval = 4000,
  primaryButton,
  buttons = [],
  images: imagesProp,
}: HeroCarouselProps) {
  const images = imagesProp && imagesProp.length > 0 ? imagesProp : DEFAULT_HERO_IMAGES;

  const [current, setCurrent] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [dir, setDir] = useState<'next' | 'prev'>('next');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (d: 'next' | 'prev') => {
      setDir(d);
      setLeaving(current);
      setCurrent((c) =>
        d === 'next' ? (c + 1) % images.length : (c - 1 + images.length) % images.length,
      );
    },
    [current, images.length],
  );

  /* autoplay */
  useEffect(() => {
    timerRef.current = setInterval(() => go('next'), autoplayInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoplayInterval, go]);

  return (
    <section
      className="relative w-full min-h-[90svh] sm:min-h-[88vh] md:min-h-screen overflow-hidden -mt-16 sm:-mt-20 md:-mt-[5.5rem]"
      aria-label="Hero carousel"
    >
      {/* ── Images: zoom + fade + slide transition ── */}
      {images.map((src, i) => {
        const isActive = i === current;
        const isLeaving = i === leaving;
        let cls =
          'absolute inset-0 will-change-[opacity,transform] transition-all duration-[1200ms] ease-[cubic-bezier(.4,0,.2,1)]';
        if (isActive) {
          cls += ' opacity-100 scale-100 translate-x-0 z-[2]';
        } else if (isLeaving) {
          cls +=
            dir === 'next'
              ? ' opacity-0 scale-[1.06] -translate-x-[3%] z-[1]'
              : ' opacity-0 scale-[1.06] translate-x-[3%] z-[1]';
        } else {
          cls += ' opacity-0 scale-110 translate-x-0 z-0';
        }
        return (
          <div key={src} className={cls} aria-hidden={!isActive}>
            <Image
              src={src}
              alt={`Level Up in Germany – event ${i + 1}`}
              fill
              className="object-cover object-center select-none pointer-events-none"
              priority={i === 0}
              unoptimized
              draggable={false}
            />
          </div>
        );
      })}

      {/* ── Premium overlay: 3-layer branded system ── */}
      {/* Layer 1 — Primary diagonal wash: brand red → brand dark, elegant depth */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        aria-hidden
        style={{
          background: `
            linear-gradient(135deg,
              rgba(140,26,26,0.52) 0%,
              rgba(140,26,26,0.30) 25%,
              rgba(26,26,26,0.22) 50%,
              rgba(26,26,26,0.10) 70%,
              transparent 90%
            )
          `,
        }}
      />
      {/* Layer 2 — Warm accent radiance: subtle orange glow, visible but refined */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 20% 80%,
              rgba(233,140,11,0.18) 0%,
              rgba(233,140,11,0.06) 40%,
              transparent 70%
            ),
            radial-gradient(ellipse 50% 40% at 80% 20%,
              rgba(233,140,11,0.08) 0%,
              transparent 60%
            )
          `,
        }}
      />
      {/* Layer 3 — Text-zone readability: lighter on mobile so the image stays visible */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none md:hidden"
        aria-hidden
        style={{
          background: `
            linear-gradient(to top,
              rgba(15,6,6,0.62) 0%,
              rgba(26,26,26,0.32) 30%,
              rgba(140,26,26,0.10) 55%,
              transparent 78%
            )
          `,
        }}
      />
      <div
        className="absolute inset-0 z-[3] pointer-events-none hidden md:block"
        aria-hidden
        style={{
          background: `
            linear-gradient(to top,
              rgba(26,26,26,0.58) 0%,
              rgba(140,26,26,0.18) 30%,
              transparent 55%
            )
          `,
        }}
      />

      {/* ── Text content — bottom-left, cinematic anchoring ── */}
      <div className="absolute inset-0 z-10 flex items-end pb-10 sm:pb-32 md:pb-36 px-5 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl w-full">
          {tagline && (
            <div className="animate-hero-tagline flex items-center gap-3 mb-3 sm:mb-5">
              <span className="h-px w-8 sm:w-10 bg-accent" />
              <p className="text-[0.65rem] sm:text-xs font-bold uppercase tracking-[0.25em] sm:tracking-[0.3em] text-accent"
                 style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                {tagline}
              </p>
            </div>
          )}
          {title && (
            <h1 className="animate-hero-title mb-3 sm:mb-5 leading-[1.15]">
              <AnimatedHeroTitle title={title} />
            </h1>
          )}
          {subtitle && (
            <p className="animate-hero-subtitle text-sm sm:text-lg md:text-xl text-white/85 mb-6 sm:mb-10 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-none"
               style={{ textShadow: '0 1px 12px rgba(0,0,0,0.35)' }}>
              {subtitle}
            </p>
          )}

          {(primaryButton || buttons.length > 0) && (
            <div className="animate-hero-buttons flex flex-row flex-wrap sm:items-center gap-2 sm:gap-5">
              {primaryButton && (() => {
                const isExternal = /^https?:\/\//i.test(primaryButton.href);
                const cls = heroBtnCls(primaryButton.colorVariant ?? 'red');
                const inner = <>{primaryButton.label}</>;
                return isExternal ? (
                  <a key="p" href={primaryButton.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                ) : (
                  <Link key="p" href={primaryButton.href} className={cls}>{inner}</Link>
                );
              })()}
              {buttons.map((btn, i) => {
                const isExternal = /^https?:\/\//i.test(btn.href);
                const cls = heroBtnCls(btn.colorVariant ?? (i === 0 ? 'white' : 'yellow'));
                return isExternal ? (
                  <a key={i} href={btn.href} target={btn.openInNewTab ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>
                    {btn.label}
                  </a>
                ) : (
                  <Link key={i} href={btn.href} className={cls}>
                    {btn.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
