'use client';

import React, { useEffect, useRef, useState } from 'react';

type AnimatedStatProps = {
  value: number;
  suffix?: string;
  label: string;
  className?: string;
};

export function AnimatedStat({ value, suffix = '', label, className = '' }: AnimatedStatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      setDisplay(value);
      setDone(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const duration = 1200;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - t) ** 3;
          setDisplay(Math.round(value * eased));
          if (t < 1) requestAnimationFrame(tick);
          else setDone(true);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-6 py-8 text-center shadow-lg transition-transform duration-300 hover:-translate-y-0.5 ${className}`}
    >
      <p
        className={`text-4xl sm:text-5xl font-bold text-white tabular-nums tracking-tight ${done ? 'stat-pop' : ''}`}
      >
        {display}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-white/75 max-w-[14rem] mx-auto leading-snug">{label}</p>
    </div>
  );
}
