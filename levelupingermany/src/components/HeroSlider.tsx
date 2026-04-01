'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';

export type HeroSlide = {
  src: string;
  alt?: string;
};

type HeroSliderProps = {
  /** Each slide = full-screen background image; swipe/dots change the slide */
  slides: HeroSlide[];
  /** Short inspiring line above the title */
  tagline?: string;
  /** Overlay title (left-aligned) */
  title?: string;
  /** Overlay subtitle (left-aligned) */
  subtitle?: string;
  /** Primary CTA: black button with arrow (e.g. "Watch Now →") */
  primaryButton?: { label: string; href: string };
  /** Extra buttons (optional, shown next to primary) */
  buttons?: { label: string; href: string }[];
  /** Auto-advance interval in ms (0 = off) */
  autoPlayMs?: number;
  className?: string;
};

export function HeroSlider({
  slides,
  tagline,
  title,
  subtitle,
  primaryButton,
  buttons = [],
  autoPlayMs = 0,
  className = '',
}: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [parallaxY, setParallaxY] = useState(0);

  const goTo = useCallback(
    (i: number) => {
      setIndex((Math.max(0, i) % slides.length + slides.length) % slides.length);
    },
    [slides.length]
  );

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  const minSwipeDistance = 50;
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) next();
      else prev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  useEffect(() => {
    if (autoPlayMs <= 0 || slides.length <= 1) return;
    const t = setInterval(next, autoPlayMs);
    return () => clearInterval(t);
  }, [autoPlayMs, index, next, slides.length]);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const onScroll = () => {
      setParallaxY(Math.min(120, window.scrollY * 0.35));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (slides.length === 0) return null;

  const currentBg = slides[index]?.src ?? '';

  return (
    <section
      className={`relative min-h-[80vh] sm:min-h-[92vh] flex overflow-hidden ${className}`}
      aria-label="Hero slider"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Full-bleed background + léger parallax */}
      <div
        className="absolute inset-0 z-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="hero-slider-bg absolute -inset-[8%] bg-cover bg-center bg-no-repeat transition-opacity duration-700 will-change-transform"
          style={{
            backgroundImage: currentBg ? `url(${currentBg})` : undefined,
            transform: `translate3d(0, ${parallaxY}px, 0) scale(1.08)`,
          }}
        />
      </div>
      {/* Overlay gradient pour lisibilité du texte + effet unifié */}
      <div
        className="absolute inset-0 z-10 hero-slider-overlay pointer-events-none"
        aria-hidden
      />

      {/* Left: vertical nav (chevron up, dots, chevron down) */}
      <div className="relative z-20 flex flex-col items-center justify-center gap-2 py-6 pl-4 sm:pl-6">
        <button
          type="button"
          onClick={prev}
          className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <div className="flex flex-col gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === index ? 'w-2.5 h-2.5 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Overlay content: titre, sous-titre, boutons – animations d’entrée au chargement */}
      <div className="relative z-20 flex flex-1 flex-col justify-between w-full min-h-0 px-6 sm:px-12 md:px-16 pt-10 sm:pt-14 pb-8">
        <div className="max-w-2xl flex-shrink-0">
          {tagline && (
            <p className="animate-hero-tagline mb-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.25em] text-accent-light drop-shadow-md">
              {tagline}
            </p>
          )}
          {title && (
            <h1 className="animate-hero-title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 drop-shadow-xl tracking-tight text-balance">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="animate-hero-subtitle text-lg sm:text-xl text-white/95 mb-8 drop-shadow-md max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        <div className="animate-hero-buttons flex flex-wrap justify-center gap-3 sm:gap-4 w-full flex-shrink-0 pb-4 sm:pb-8">
          {primaryButton && (
            (() => {
              const href = primaryButton.href;
              const isExternal = /^https?:\/\//i.test(href);
              const className =
                'group hero-cta-glow inline-flex items-center justify-center gap-2 min-w-[220px] sm:min-w-[240px] h-12 sm:h-14 px-6 rounded-full bg-primary text-white font-semibold shadow-xl border-2 border-primary/80 hover:bg-primary-light hover:border-primary-light hover:scale-[1.03] active:scale-[0.98] transition-all duration-300';
              const inner = (
                <>
                  {primaryButton.label}
                  <span aria-hidden className="group-hover:translate-x-0.5 transition-transform">→</span>
                </>
              );
              return isExternal ? (
                <a
                  key="primary"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {inner}
                </a>
              ) : (
                <Link key="primary" href={href} className={className}>
                  {inner}
                </Link>
              );
            })()
          )}
          {buttons[0] && (
            <Link
              href={buttons[0].href}
              className="group inline-flex items-center justify-center gap-2 min-w-[220px] sm:min-w-[240px] h-12 sm:h-14 px-6 rounded-full bg-white/10 text-white font-semibold backdrop-blur-sm border-2 border-white/70 hover:bg-white hover:text-brand-dark hover:border-white hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-lg"
            >
              {buttons[0].label}
            </Link>
          )}
          {buttons[1] && (
            <Link
              href={buttons[1].href}
              className="group inline-flex items-center justify-center gap-2 min-w-[220px] sm:min-w-[240px] h-12 sm:h-14 px-6 rounded-full bg-accent text-white font-semibold shadow-xl border-2 border-accent/90 hover:bg-accent-light hover:border-accent-light transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              {buttons[1].label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
