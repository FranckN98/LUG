'use client';

import { useEffect, useMemo, useState } from 'react';
import { computeTimeLeft, DEFAULT_COUNTDOWN_COPY, type CountdownLocale } from '@/lib/countdown';
import './countdown.css';

type CountdownProps = {
  targetDate: string; // ISO 8601
  locale: CountdownLocale;
  title?: string | null;
  subtitle?: string | null;
  endedMessage?: string | null;
  className?: string;
};

const LABELS: Record<CountdownLocale, [string, string, string, string]> = {
  fr: ['JOURS', 'HEURES', 'MIN', 'SEC'],
  en: ['DAYS', 'HOURS', 'MINS', 'SECS'],
  de: ['TAGE', 'STD', 'MIN', 'SEK'],
};

function pad(n: number, width = 2): string {
  return n.toString().padStart(width, '0');
}

function Unit({ value, label, width = 2 }: { value: number; label: string; width?: number }) {
  const padded = pad(value, width);
  return (
    <div className="cd-unit">
      <div className="cd-value" aria-live="off">
        {/* key on the value triggers a fresh tick animation */}
        <span key={padded}>{padded}</span>
      </div>
      <div className="cd-label">{label}</div>
    </div>
  );
}

export function Countdown({
  targetDate,
  locale,
  title,
  subtitle,
  endedMessage,
  className = '',
}: CountdownProps) {
  const targetMs = useMemo(() => new Date(targetDate).getTime(), [targetDate]);
  const defaults = DEFAULT_COUNTDOWN_COPY[locale];
  const resolvedTitle = title?.trim() || defaults.title;
  const resolvedSubtitle = subtitle?.trim() || defaults.subtitle;
  const resolvedEnded = endedMessage?.trim() || defaults.ended;

  // Start with a deterministic value (server render = computed from targetMs without "now")
  // to avoid hydration mismatches; the client effect immediately updates with the real "now".
  const [tick, setTick] = useState<number>(0);

  useEffect(() => {
    if (Number.isNaN(targetMs)) return;
    const update = () => setTick(Date.now());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (Number.isNaN(targetMs)) return null;

  // On the server, "tick" is 0, so we render the placeholder once; the client
  // immediately replaces it with the real countdown.
  const left = tick > 0
    ? computeTimeLeft(targetMs, tick)
    : computeTimeLeft(targetMs, targetMs); // renders 00 00 00 00 on first paint

  const [dLabel, hLabel, mLabel, sLabel] = LABELS[locale];

  return (
    <div className={`countdown-widget ${className}`} role="timer" aria-label={resolvedTitle}>
      {resolvedTitle && <div className="cd-title">{resolvedTitle}</div>}

      {left.isOver ? (
        <div className="cd-ended">{resolvedEnded}</div>
      ) : (
        <>
          <div className="cd-grid">
            <Unit value={left.days} label={dLabel} width={left.days >= 100 ? 3 : 2} />
            <Unit value={left.hours} label={hLabel} />
            <Unit value={left.minutes} label={mLabel} />
            <Unit value={left.seconds} label={sLabel} />
          </div>
          {resolvedSubtitle && <div className="cd-subtitle">{resolvedSubtitle}</div>}
        </>
      )}
    </div>
  );
}

export default Countdown;
