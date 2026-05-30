'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DEFAULT_HERO_IMAGES } from '@/lib/heroDefaults';
import Countdown from '@/components/Countdown';
import type { CountdownLocale } from '@/lib/countdown';

interface HeroCarouselProps {
  title?: string;
  tagline?: string;
  subtitle?: string;
  infoLine?: string;
  autoplayInterval?: number;
  primaryButton?: { label: string; href: string; colorVariant?: string };
  buttons?: { label: string; href: string; colorVariant?: string; openInNewTab?: boolean }[];
  stats?: { value: number; suffix: string; label: string }[];
  images?: string[];
  countdown?: {
    targetDate: string;
    locale: CountdownLocale;
    title?: string | null;
    subtitle?: string | null;
    endedMessage?: string | null;
  } | null;
}

function AnimatedHeroTitle({ title }: { title: string }) {
  return (
    <span className="hero-typewriter" aria-label={title}>
      {title}
    </span>
  );
}

/* ── Floating decorative themed elements (right side, desktop only) ──────────────
   Inspired by premium SaaS landing heroes: glassmorphic cards, pills and badges
   themed around Level Up in Germany (community, networking, career, Frankfurt).   */
function HeroFloatingElements() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] hidden lg:block" aria-hidden>
      {/* Warm luminous halo behind the themes card */}
      <div
        className="absolute right-[12%] top-[34%] h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(233,140,11,0.26) 0%, transparent 70%)' }}
      />

      {/* Themes / pillars card (dark glass) */}
      <div
        className="hero-float-el absolute right-[12%] top-[38%] w-64"
        style={{ animationDelay: '0.3s' }}
      >
        <div className="hero-float-b">
          <div className="rounded-2xl border border-white/10 bg-[#1a1212]/85 p-3 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
            {[
              { icon: '🤝', label: 'Networking' },
              { icon: '🚀', label: 'Carrière' },
              { icon: '💡', label: 'Business' },
            ].map((row) => (
              <div
                key={row.label}
                className="mb-1.5 flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2 last:mb-0"
              >
                <span className="text-base">{row.icon}</span>
                <span className="text-sm font-medium text-white/90">{row.label}</span>
                <span className="ml-auto flex flex-col gap-[3px]">
                  <span className="h-[2px] w-3.5 rounded bg-white/30" />
                  <span className="h-[2px] w-3.5 rounded bg-white/30" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Button color variants (hero dark background context) ──────────────────────
const BASE_BTN = 'group inline-flex w-full sm:w-auto items-center justify-center h-12 sm:h-14 px-8 rounded-full font-semibold hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 text-sm sm:text-base';

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
    case 'green':
      return `${BASE_BTN} bg-[#2f5d3a] text-white shadow-[0_4px_20px_rgba(47,93,58,0.35)] hover:bg-[#377045] hover:shadow-[0_6px_28px_rgba(47,93,58,0.50)]`;
    case 'red':
    default:
      return `${BASE_BTN} bg-primary text-white shadow-[0_4px_20px_rgba(140,26,26,0.35)] hover:bg-primary-light hover:shadow-[0_6px_28px_rgba(140,26,26,0.45)] gap-2`;
  }
}

export default function HeroCarousel({
  title,
  tagline,
  subtitle,
  infoLine,
  autoplayInterval = 4000,
  primaryButton,
  buttons = [],
  images: imagesProp,
  countdown,
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
      {/* Layer 1 — Strong left-side dark wash for text legibility, fading right */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        aria-hidden
        style={{
          background: `
            linear-gradient(to right,
              rgba(15,6,6,0.82) 0%,
              rgba(15,6,6,0.65) 25%,
              rgba(15,6,6,0.40) 45%,
              rgba(15,6,6,0.18) 65%,
              transparent 85%
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

      {/* ── Floating decorative themed elements (premium landing, desktop only) ── */}
      <HeroFloatingElements />

      {/* ── Text content — bottom-left, cinematic anchoring ── */}
      <div className="absolute inset-0 z-10 flex items-end pb-16 sm:pb-28 md:pb-36 px-5 sm:px-10 md:px-16 lg:px-20">
        <div className="w-full max-w-3xl">
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
            <h1 className="animate-hero-title mb-3 sm:mb-5 leading-[1.12]">
              <AnimatedHeroTitle title={title} />
            </h1>
          )}
          {subtitle && (
            <p className="animate-hero-subtitle text-sm sm:text-lg md:text-xl text-white/85 mb-5 sm:mb-8 max-w-xl leading-relaxed"
               style={{ textShadow: '0 1px 12px rgba(0,0,0,0.35)' }}>
              {subtitle}
            </p>
          )}

          {countdown && countdown.targetDate && (
            <div className="animate-hero-subtitle mb-5 sm:mb-8 flex justify-center sm:justify-start">
              <Countdown
                targetDate={countdown.targetDate}
                locale={countdown.locale}
                title={countdown.title}
                subtitle={countdown.subtitle}
                endedMessage={countdown.endedMessage}
              />
            </div>
          )}

          {infoLine && (
            <p
              className="animate-hero-subtitle mb-5 sm:mb-8 text-[0.7rem] sm:text-sm font-medium tracking-wide text-white/75 max-w-xl"
              style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}
            >
              {infoLine}
            </p>
          )}

          {(primaryButton || buttons.length > 0) && (
            <div className="animate-hero-buttons flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-5 max-w-sm sm:max-w-none">
              {primaryButton && (() => {
                const isExternal = /^https?:\/\//i.test(primaryButton.href);
                const cls = heroBtnCls(primaryButton.colorVariant ?? 'yellow');
                const inner = <>{primaryButton.label}</>;
                return isExternal ? (
                  <a key="p" href={primaryButton.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                ) : (
                  <Link key="p" href={primaryButton.href} className={cls}>{inner}</Link>
                );
              })()}
              {buttons.map((btn, i) => {
                const isExternal = /^https?:\/\//i.test(btn.href);
                const cls = heroBtnCls(btn.colorVariant ?? 'white');
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
