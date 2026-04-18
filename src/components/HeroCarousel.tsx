'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroCarouselProps {
  title?: string;
  tagline?: string;
  subtitle?: string;
  autoplayInterval?: number;
  primaryButton?: { label: string; href: string };
  buttons?: { label: string; href: string }[];
  stats?: { value: number; suffix: string; label: string }[];
}

const images = [
  '/hero-pic/leveluper1.jpg',
  '/hero-pic/leveluper2.jpg',
  '/hero-pic/leveluper5.jpg',
  '/hero-pic/leveluper7.jpg',
  '/hero-pic/leveluper8.jpeg',
  '/hero-pic/_DSC8828.JPG',
  '/hero-pic/_DSC8987.JPG',
  '/hero-pic/_DSC9034.JPG',
  '/hero-pic/_DSC9293.JPG',
];

export default function HeroCarousel({
  title,
  tagline,
  subtitle,
  autoplayInterval = 4000,
  primaryButton,
  buttons = [],
}: HeroCarouselProps) {
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
    [current],
  );

  /* autoplay */
  useEffect(() => {
    timerRef.current = setInterval(() => go('next'), autoplayInterval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoplayInterval, go]);

  return (
    <section
      className="relative w-full min-h-[88vh] sm:min-h-screen overflow-hidden -mt-16 sm:-mt-20 md:-mt-[5.5rem]"
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
      {/* Layer 3 — Text-zone readability: soft bottom veil with brand depth */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
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
      <div className="absolute inset-0 z-10 flex items-end pb-24 sm:pb-32 md:pb-36 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl">
          {tagline && (
            <div className="animate-hero-tagline flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-accent" />
              <p className="text-[0.7rem] sm:text-xs font-bold uppercase tracking-[0.3em] text-accent"
                 style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                {tagline}
              </p>
            </div>
          )}
          {title && (
            <h1 className="animate-hero-title font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 tracking-tight leading-[1.08]"
                style={{ textShadow: '0 2px 20px rgba(26,26,26,0.5), 0 1px 3px rgba(0,0,0,0.3)' }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="animate-hero-subtitle text-base sm:text-lg md:text-xl text-white/85 mb-10 max-w-xl leading-relaxed"
               style={{ textShadow: '0 1px 12px rgba(0,0,0,0.35)' }}>
              {subtitle}
            </p>
          )}

          {(primaryButton || buttons.length > 0) && (
            <div className="animate-hero-buttons flex flex-wrap items-center gap-4 sm:gap-5">
              {primaryButton && (() => {
                const isExternal = /^https?:\/\//i.test(primaryButton.href);
                const cls =
                  'group inline-flex items-center justify-center gap-2 h-12 sm:h-14 px-8 rounded-full bg-primary text-white font-semibold shadow-[0_4px_20px_rgba(140,26,26,0.35),0_1px_3px_rgba(0,0,0,0.2)] hover:bg-primary-light hover:shadow-[0_6px_28px_rgba(140,26,26,0.45),0_2px_6px_rgba(0,0,0,0.15)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 text-sm sm:text-base';
                const inner = (
                  <>
                    {primaryButton.label}
                    <span aria-hidden className="inline-block group-hover:translate-x-0.5 transition-transform">→</span>
                  </>
                );
                return isExternal ? (
                  <a key="p" href={primaryButton.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                ) : (
                  <Link key="p" href={primaryButton.href} className={cls}>{inner}</Link>
                );
              })()}
              {buttons[0] && (
                <Link
                  href={buttons[0].href}
                  className="inline-flex items-center justify-center h-12 sm:h-14 px-8 rounded-full bg-white/[0.12] text-white font-semibold backdrop-blur-md border border-white/25 shadow-[0_4px_16px_rgba(0,0,0,0.15)] hover:bg-white/95 hover:text-brand-dark hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-250 text-sm sm:text-base"
                >
                  {buttons[0].label}
                </Link>
              )}
              {buttons[1] && (
                <Link
                  href={buttons[1].href}
                  className="inline-flex items-center justify-center h-12 sm:h-14 px-8 rounded-full bg-accent text-white font-semibold shadow-[0_4px_20px_rgba(233,140,11,0.30),0_1px_3px_rgba(0,0,0,0.2)] hover:bg-accent-light hover:shadow-[0_6px_28px_rgba(233,140,11,0.40),0_2px_6px_rgba(0,0,0,0.12)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 text-sm sm:text-base"
                >
                  {buttons[1].label}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
