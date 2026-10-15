import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import { getLemfiCopy, LEMFI_DATE_LOCALE, resolveLemfiLocale } from '@/content/lemfi-contest';
import { getEntryForParticipant } from '@/lib/lemfiContest';
import { formatLemfiNumber } from '@/lib/lemfiContestUtils';
import { CoBrand } from '../../_components/CoBrand';
import { HeroBackdrop } from '../../_components/HeroBackdrop';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string; token: string }> };

// Le lien contient un secret : pas d'indexation, pas de Referer sortant, pas d'URL canonique.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: getLemfiCopy(locale).seo.title,
    robots: { index: false, follow: false },
    referrer: 'no-referrer',
  };
}

const TONES = {
  pending: 'border-amber-300/70 bg-amber-50 text-amber-950',
  validated: 'border-emerald-300/70 bg-emerald-50 text-emerald-950',
  rejected: 'border-red-300/70 bg-red-50 text-red-950',
} as const;

export default async function TrackPage({ params }: Props) {
  const { locale, token } = await params;
  const loc = resolveLemfiLocale(locale, 'en') as Locale;
  const t = getLemfiCopy(loc);
  const entry = await getEntryForParticipant(token);
  if (!entry) notFound();

  const fmt = new Intl.DateTimeFormat(LEMFI_DATE_LOCALE[loc], {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  });
  const status = (entry.status === 'validated' || entry.status === 'rejected' ? entry.status : 'pending') as
    | 'pending'
    | 'validated'
    | 'rejected';
  const copy = t.track[status];

  return (
    <div className="bg-[#F4F1EB]">
      <HeroBackdrop className="pb-20 pt-5 sm:pb-24 sm:pt-7">
        <div className="mx-auto max-w-3xl px-4">
          <CoBrand homeHref={`/${loc}`} homeAria={t.homeAria} />
        </div>
      </HeroBackdrop>

      <div className="relative z-10 mx-auto -mt-12 max-w-xl px-4 pb-24">
        <div className="rounded-3xl bg-white p-6 text-center shadow-[0_30px_80px_-34px_rgba(4,38,26,0.6)] ring-1 ring-[#0A3D27]/10 sm:p-9">
          <p className="text-sm text-[#04261A]/70">{t.track.hello(entry.firstName)}</p>
          <p className="mt-1 bg-gradient-to-b from-[#F5B800] to-[#c98f00] bg-clip-text font-display text-7xl font-bold tracking-wide text-transparent lining-nums">
            {formatLemfiNumber(entry.sequentialNumber)}
          </p>

          <div className={`mt-6 rounded-2xl border px-4 py-4 text-left ${TONES[status]}`}>
            <p className="font-bold">{copy.title}</p>
            <p className="mt-1 text-sm">{copy.text}</p>
            {status !== 'pending' && entry.decisionReason && (
              <p className="mt-2 text-sm">
                <span className="font-semibold">{t.track.reason}</span> {entry.decisionReason}
              </p>
            )}
          </div>

          <dl className="mt-6 space-y-1.5 text-left text-sm text-[#04261A]/70">
            <div className="flex justify-between gap-3">
              <dt>{t.track.receivedOn}</dt>
              <dd className="text-right font-medium text-[#04261A]">{fmt.format(entry.createdAt)}</dd>
            </div>
            {entry.decidedAt && (
              <div className="flex justify-between gap-3">
                <dt>{t.track.decidedOn}</dt>
                <dd className="text-right font-medium text-[#04261A]">{fmt.format(entry.decidedAt)}</dd>
              </div>
            )}
            {entry.emailSentAt && (
              <div className="flex justify-between gap-3">
                <dt>{t.track.emailSentOn}</dt>
                <dd className="text-right font-medium text-[#04261A]">{fmt.format(entry.emailSentAt)}</dd>
              </div>
            )}
          </dl>

          <p className="mt-6 text-xs text-[#04261A]/55">{t.track.personalNote}</p>
        </div>
      </div>
    </div>
  );
}
