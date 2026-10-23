'use client';

import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { ProgrammeBlock, ProgrammeItem } from '@/content/events-2025-detail';

type Ui = {
  moderatedBy: string;
  track: string;
  german: string;
  legend: string;
  expandAll: string;
  collapseAll: string;
  sessions: (n: number) => string;
  tracks: (n: number) => string;
};

const UI: Record<Locale, Ui> = {
  fr: {
    moderatedBy: 'Modéré par',
    track: 'Parcours',
    german: 'Session en allemand',
    legend: 'Session en allemand',
    expandAll: 'Tout déplier',
    collapseAll: 'Tout replier',
    sessions: (n) => `${n} session${n > 1 ? 's' : ''}`,
    tracks: (n) => `${n} parcours`,
  },
  en: {
    moderatedBy: 'Moderated by',
    track: 'Track',
    german: 'Session in German',
    legend: 'Session in German',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    sessions: (n) => `${n} session${n > 1 ? 's' : ''}`,
    tracks: (n) => `${n} track${n > 1 ? 's' : ''}`,
  },
  de: {
    moderatedBy: 'Moderation',
    track: 'Track',
    german: 'Session auf Deutsch',
    legend: 'Session auf Deutsch',
    expandAll: 'Alle öffnen',
    collapseAll: 'Alle schließen',
    sessions: (n) => `${n} Session${n > 1 ? 's' : ''}`,
    tracks: (n) => `${n} Track${n > 1 ? 's' : ''}`,
  },
};

/** Un programme est « détaillé » dès qu'une partie est numérotée ou comporte des parcours. */
export function isDetailedProgramme(blocks: ProgrammeBlock[] | undefined): blocks is ProgrammeBlock[] {
  return !!blocks?.some((b) => b.number !== undefined || b.tracks?.length);
}

function splitTime(time: string): [string, string | undefined] {
  const [start, end] = time.split('–');
  return [start!.trim(), end?.trim()];
}

const allItems = (block: ProgrammeBlock): ProgrammeItem[] => [...block.items, ...(block.tracks ?? []).flatMap((t) => t.items)];

/** De l'heure de début la plus tôt à l'heure de fin la plus tardive de la partie (HH:MM se compare en texte). */
function blockSpan(block: ProgrammeBlock): string | null {
  const items = allItems(block);
  const starts = items.map((i) => splitTime(i.time)[0]);
  const ends = items.map((i) => splitTime(i.time)[1]).filter((e): e is string => !!e);
  if (!starts.length || !ends.length) return null;
  return `${starts.reduce((a, b) => (a < b ? a : b))}–${ends.reduce((a, b) => (a > b ? a : b))}`;
}

function DeBadge({ locale, className = '' }: { locale: Locale; className?: string }) {
  return (
    <span
      title={UI[locale].german}
      aria-label={UI[locale].german}
      className={`inline-flex items-center rounded-md bg-brand-dark px-1.5 py-0.5 align-middle text-[0.65rem] font-bold leading-none tracking-wider text-white ${className}`}
    >
      DE
    </span>
  );
}

function SessionBody({ item, locale }: { item: ProgrammeItem; locale: Locale }) {
  const isBreak = item.kind === 'break';
  return (
    <>
      <p className={`break-words ${isBreak ? 'font-medium leading-snug text-gray-700' : 'font-semibold leading-snug text-brand-dark'}`}>
        {item.lang && <DeBadge locale={locale} className="mr-2 -translate-y-px" />}
        {item.title}
      </p>
      {item.desc && <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.desc}</p>}
      {item.speakers && item.speakers.length > 0 && (
        <p className="mt-1.5 text-sm font-medium leading-snug text-primary">{item.speakers.join(' · ')}</p>
      )}
      {item.moderator && (
        <p className="mt-1 text-xs text-gray-500">
          {UI[locale].moderatedBy} <span className="font-semibold text-gray-700">{item.moderator}</span>
        </p>
      )}
    </>
  );
}

function Timeline({ items, locale }: { items: ProgrammeItem[]; locale: Locale }) {
  return (
    <ol className="relative ml-3 mt-1 border-l-2 border-primary/15 sm:ml-[7.5rem]">
      {items.map((item, i) => {
        const [start, end] = splitTime(item.time);
        const isBreak = item.kind === 'break';
        return (
          <li key={i} className="relative pb-3 pl-6 last:pb-0">
            <span
              aria-hidden="true"
              className={`absolute -left-[7px] top-4 h-3 w-3 rounded-full ring-4 ring-white ${isBreak ? 'bg-gray-300' : 'bg-accent'}`}
            />
            <p className="mb-1.5 text-xs tabular-nums sm:absolute sm:right-full sm:top-3 sm:mb-0 sm:mr-5 sm:w-24 sm:text-right">
              <span className="text-sm font-bold text-primary sm:text-base">{start}</span>
              {end && <span className="font-medium text-gray-400 sm:block sm:text-xs"> – {end}</span>}
            </p>
            <div
              className={
                isBreak
                  ? 'rounded-xl border border-dashed border-gray-200 bg-gray-50/80 px-4 py-3'
                  : 'rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm'
              }
            >
              <SessionBody item={item} locale={locale} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TicketIcon() {
  return (
    <svg className="mt-0.5 h-6 w-6 shrink-0 text-accent-dark" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
      />
    </svg>
  );
}

function Tracks({ block, locale }: { block: ProgrammeBlock; locale: Locale }) {
  return (
    <>
      {block.trackNotice && (
        <div role="note" className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4">
          <TicketIcon />
          <p className="text-sm font-semibold leading-snug text-brand-dark sm:text-base">{block.trackNotice}</p>
        </div>
      )}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {block.tracks!.map((track) => (
          <section
            key={track.id}
            aria-label={`${UI[locale].track} ${track.id} · ${track.name}`}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
          >
            <header className="flex items-center gap-3 bg-gradient-to-br from-primary to-primary-dark px-4 py-3.5 text-white">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 font-display text-2xl font-bold leading-none"
              >
                {track.id}
              </span>
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent-light">{UI[locale].track}</p>
                <h5 className="text-lg font-bold leading-tight">{track.name}</h5>
              </div>
            </header>
            <ol className="divide-y divide-gray-100">
              {track.items.map((item, i) => (
                <li key={i} className="px-4 py-4">
                  <p className="mb-2 inline-flex rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold tabular-nums text-primary">
                    {item.time}
                  </p>
                  <SessionBody item={item} locale={locale} />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
    </svg>
  );
}

export function ProgrammeTimeline({ blocks, locale }: { blocks: ProgrammeBlock[]; locale: Locale }) {
  const ui = UI[locale];
  const [open, setOpen] = useState<boolean[]>([]);
  const isOpen = (i: number) => open[i] ?? false;
  const allOpen = blocks.every((_, i) => isOpen(i));
  const hasGerman = blocks.some((b) => allItems(b).some((i) => i.lang === 'DE'));

  const toggle = (i: number) => setOpen(blocks.map((_, k) => (k === i ? !isOpen(k) : isOpen(k))));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {hasGerman ? (
          <p className="flex items-center gap-2 text-xs text-gray-500">
            <DeBadge locale={locale} />
            <span>= {ui.legend}</span>
          </p>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={() => setOpen(blocks.map(() => !allOpen))}
          className="rounded-full border border-primary/25 bg-white px-4 py-1.5 text-xs font-semibold text-primary transition hover:border-accent hover:bg-accent/5"
        >
          {allOpen ? ui.collapseAll : ui.expandAll}
        </button>
      </div>

      {blocks.map((block, bi) => {
        const span = blockSpan(block);
        const sessions = allItems(block).filter((i) => i.kind !== 'break').length;
        const expanded = isOpen(bi);
        const headingId = `programme-part-${bi}`;
        const panelId = `programme-panel-${bi}`;
        const meta = [span, block.tracks?.length ? ui.tracks(block.tracks.length) : null, ui.sessions(sessions)].filter(Boolean);

        return (
          <section
            key={bi}
            className={`rounded-2xl border bg-white transition-shadow ${expanded ? 'border-primary/25 shadow-md' : 'border-gray-100 shadow-sm'}`}
          >
            <h4 className="m-0">
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => toggle(bi)}
                className="flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left transition hover:bg-gray-50/70 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 sm:px-5"
              >
                {block.number !== undefined && (
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark font-display text-2xl font-bold leading-none text-white shadow-md shadow-primary/20 lining-nums"
                  >
                    {block.number}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span id={headingId} className="block text-sm font-bold uppercase leading-snug tracking-wide text-brand-dark sm:text-base">
                    {block.heading}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-gray-500 sm:text-sm">
                    <span className="font-semibold tabular-nums text-accent-dark">{meta[0]}</span>
                    {meta.slice(1).map((m) => ` · ${m}`)}
                  </span>
                  {block.tracks?.length ? (
                    <span className="mt-0.5 block text-xs text-gray-400">{block.tracks.map((t) => t.name).join(' · ')}</span>
                  ) : null}
                </span>
                <Chevron open={expanded} />
              </button>
            </h4>

            <div
              id={panelId}
              role="region"
              aria-labelledby={headingId}
              className={expanded ? 'animate-tab-fade-in border-t border-gray-100 px-4 pb-5 pt-5 sm:px-5' : 'hidden print:block print:px-5 print:pb-5'}
            >
              {block.tracks?.length ? <Tracks block={block} locale={locale} /> : <Timeline items={block.items} locale={locale} />}
            </div>
          </section>
        );
      })}
    </div>
  );
}
