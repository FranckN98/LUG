'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

type Photo = { src: string; alt?: string };

const SPEED_PX_PER_SEC = 38;

// Widths cycle to create a natural, non-uniform rhythm
const WIDTHS = [230, 310, 250, 360, 270, 320, 210, 290, 340, 240, 300, 260];

export function PhotoStrip({ photos, label = 'Galerie photos Level Up in Germany' }: { photos: Photo[]; label?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTsRef = useRef<number>(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);
  const touchStartX = useRef(0);
  const touchScrollLeft = useRef(0);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dragging, setDragging] = useState(false);

  // Triple the photos for seamless infinite loop
  const tripled = [...photos, ...photos, ...photos];

  // Init: start at the middle copy so we can scroll in both directions
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.scrollLeft = el.scrollWidth / 3;
      })
    );
  }, []);

  // RAF auto-scroll loop
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = media.matches;
    const onChange = () => {
      reducedMotionRef.current = media.matches;
    };
    media.addEventListener('change', onChange);

    const step = (ts: number) => {
      const oneSet = el.scrollWidth / 3;

      // Seamless loop correction (runs even when paused, for drag recovery)
      if (el.scrollLeft >= oneSet * 2) {
        el.scrollLeft -= oneSet;
      } else if (el.scrollLeft < oneSet * 0.05) {
        el.scrollLeft += oneSet;
      }

      // Auto-advance when not paused (never with reduced motion: the strip stays scrollable by hand)
      if (!isPausedRef.current && !reducedMotionRef.current && lastTsRef.current) {
        const dt = Math.min(ts - lastTsRef.current, 100); // cap to avoid jumps on tab refocus
        el.scrollLeft += (SPEED_PX_PER_SEC * dt) / 1000;
      }

      lastTsRef.current = ts;
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      media.removeEventListener('change', onChange);
    };
  }, []);

  const pause = useCallback(() => {
    isPausedRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
  }, []);

  const resume = useCallback((delayMs = 1500) => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      isPausedRef.current = false;
    }, delayMs);
  }, []);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    setDragging(true);
    dragStartX.current = e.clientX;
    dragScrollLeft.current = containerRef.current?.scrollLeft ?? 0;
    pause();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;
    el.scrollLeft = dragScrollLeft.current - (e.clientX - dragStartX.current);
  };

  const onMouseUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);
    resume(1500);
  };

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchScrollLeft.current = containerRef.current?.scrollLeft ?? 0;
    pause();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollLeft = touchScrollLeft.current - (e.touches[0].clientX - touchStartX.current);
  };

  const onTouchEnd = () => resume(2500);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={label}
      tabIndex={0}
      className={`flex overflow-x-scroll gap-3 sm:gap-4 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {tripled.map((photo, i) => {
        const isMiddleCopy = i >= photos.length && i < photos.length * 2;
        return (
          <div
            key={`${photo.src}-${i}`}
            className="shrink-0 h-60 sm:h-72 md:h-84 rounded-xl sm:rounded-2xl overflow-hidden ring-1 ring-black/10"
            style={{ width: `${WIDTHS[i % WIDTHS.length]}px` }}
            aria-hidden={isMiddleCopy ? undefined : true}
          >
            <img
              src={photo.src}
              alt={isMiddleCopy ? (photo.alt ?? 'Level Up in Germany') : ''}
              className="h-full w-full object-cover pointer-events-none motion-safe:transition-transform motion-safe:duration-700 motion-safe:hover:scale-[1.04]"
              draggable={false}
              loading="lazy"
            />
          </div>
        );
      })}
    </div>
  );
}
