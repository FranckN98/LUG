import type { Locale } from '@/i18n/config';
import type { ProgrammeBlock, ProgrammeItem } from '@/content/events-2025-detail';

const UI: Record<Locale, { moderatedBy: string; track: string; german: string; legend: string }> = {
  fr: { moderatedBy: 'Modéré par', track: 'Parcours', german: 'Session en allemand', legend: 'Session en allemand' },
  en: { moderatedBy: 'Moderated by', track: 'Track', german: 'Session in German', legend: 'Session in German' },
  de: { moderatedBy: 'Moderation', track: 'Track', german: 'Session auf Deutsch', legend: 'Session auf Deutsch' },
};

/** Un programme est « détaillé » dès qu'une partie est numérotée ou comporte des parcours. */
export function isDetailedProgramme(blocks: ProgrammeBlock[] | undefined): blocks is ProgrammeBlock[] {
  return !!blocks?.some((b) => b.number !== undefined || b.tracks?.length);
}

function splitTime(time: string): [string, string | undefined] {
  const [start, end] = time.split('–');
  return [start!.trim(), end?.trim()];
}

/** De l'heure de début la plus tôt à l'heure de fin la plus tardive de la partie (HH:MM se compare en texte). */
function blockSpan(block: ProgrammeBlock): string | null {
  const items = [...block.items, ...(block.tracks ?? []).flatMap((t) => t.items)];
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
    <ol className="relative ml-3 mt-5 border-l-2 border-primary/15 sm:ml-[7.5rem]">
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
        <div role="note" className="mt-5 flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4">
          <TicketIcon />
          <p className="text-sm font-semibold leading-snug text-brand-dark sm:text-base">{block.trackNotice}</p>
        </div>
      )}
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
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

export function ProgrammeTimeline({ blocks, locale }: { blocks: ProgrammeBlock[]; locale: Locale }) {
  const hasGerman = blocks.some((b) => [...b.items, ...(b.tracks ?? []).flatMap((t) => t.items)].some((i) => i.lang === 'DE'));

  return (
    <div className="space-y-12">
      {hasGerman && (
        <p className="flex items-center gap-2 text-xs text-gray-500">
          <DeBadge locale={locale} />
          <span>= {UI[locale].legend}</span>
        </p>
      )}

      {blocks.map((block, bi) => {
        const span = blockSpan(block);
        return (
          <section key={bi} aria-labelledby={`programme-part-${bi}`}>
            <div className="flex items-start gap-4">
              {block.number !== undefined && (
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-dark font-display text-2xl font-bold leading-none text-white shadow-md shadow-primary/20"
                >
                  {block.number}
                </span>
              )}
              <div className="min-w-0">
                <h4 id={`programme-part-${bi}`} className="text-base font-bold uppercase leading-snug tracking-wide text-brand-dark sm:text-lg">
                  {block.heading}
                </h4>
                {span && <p className="mt-0.5 text-sm font-semibold tabular-nums text-accent-dark">{span}</p>}
              </div>
            </div>

            {block.tracks?.length ? <Tracks block={block} locale={locale} /> : <Timeline items={block.items} locale={locale} />}
          </section>
        );
      })}
    </div>
  );
}
