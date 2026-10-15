import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { getLemfiPublicSettings } from '@/config/lemfiContest';
import { getLemfiCopy, resolveLemfiLocale } from '@/content/lemfi-contest';
import { buildPageMetadata } from '@/lib/seo';
import { isContestFull } from '@/lib/lemfiContest';
import { CoBrand } from './_components/CoBrand';
import { CopyCode } from './_components/CopyCode';
import { HeroBackdrop } from './_components/HeroBackdrop';
import { RegistrationForm } from './_components/RegistrationForm';

export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const loc = resolveLemfiLocale(locale, 'en') as Locale;
  return buildPageMetadata(loc, '/lemfi-contest', getLemfiCopy(loc).seo);
}

const icon = 'h-5 w-5 shrink-0';

function Sparkles() {
  return (
    <svg className={icon} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
  );
}

function Calendar() {
  return (
    <svg className={icon} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function StepCard({ n, title, children }: { n: number; title: string; children?: React.ReactNode }) {
  return (
    <li className="relative flex flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-[0_28px_70px_-32px_rgba(4,38,26,0.55)] ring-1 ring-[#0A3D27]/10 before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-[#F5B800] before:to-transparent sm:p-7">
      <span
        aria-hidden="true"
        className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE08A] to-[#F5B800] text-xl font-extrabold text-[#04261A] shadow-md"
      >
        {n}
      </span>
      <h2 className="text-lg font-bold leading-snug text-[#04261A] sm:text-xl">{title}</h2>
      {children}
    </li>
  );
}

export default async function LemFiContestPage({ params }: Props) {
  const { locale } = await params;
  const loc = resolveLemfiLocale(locale, 'en') as Locale;
  const t = getLemfiCopy(loc);
  const settings = getLemfiPublicSettings();
  const full = await isContestFull().catch(() => false);

  const prizes = [t.prizes.tablet, t.prizes.headphones, t.prizes.umbrella, t.prizes.tshirt, t.prizes.surprises];

  return (
    <div className="bg-[#F4F1EB]">
      <HeroBackdrop className="pb-24 pt-5 sm:pb-32 sm:pt-7">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 text-center">
          <CoBrand homeHref={`/${loc}`} homeAria={t.homeAria} />

          <h1 className="mt-4 font-display text-5xl font-bold leading-[1.02] sm:mt-5 sm:text-6xl">
            <span className="bg-gradient-to-b from-[#FFE08A] to-[#F5B800] bg-clip-text text-transparent">{t.kicker}</span>
          </h1>

          <p
            role="note"
            className="mt-4 flex max-w-xl items-start gap-3 rounded-2xl border border-[#F5B800]/60 bg-[#F5B800]/10 px-4 py-3 text-left text-sm font-semibold leading-snug text-[#FFE08A] shadow-[0_0_0_1px_rgba(245,184,0,0.12)_inset] backdrop-blur sm:text-base"
          >
            <span className="mt-0.5 text-[#F5B800]"><Sparkles /></span>
            <span>{t.notice}</span>
          </p>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{t.intro}</p>

          <p className="mt-4 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
            <span className="text-[#F5B800]"><Calendar /></span>
            {t.eventLine}
          </p>

          <ul className="mt-4 flex flex-wrap justify-center gap-2" aria-label={t.prizes.surprises}>
            {prizes.map((p) => (
              <li key={p} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/10">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </HeroBackdrop>

      <div className="relative z-10 mx-auto -mt-14 max-w-5xl px-4 pb-24 sm:-mt-20">
        <p className="sr-only">{t.stepsLabel}</p>
        <ol className="grid gap-4 md:grid-cols-3">
          <StepCard n={1} title={t.step1.title}>
            <p className="mt-1.5 text-sm text-[#04261A]/70">{t.step1.detail}</p>
            <div className="mt-auto pt-5">
              {settings.partnerUrl ? (
                <a
                  href={settings.partnerUrl}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-b from-[#FFE08A] to-[#F5B800] px-6 text-base font-bold text-[#04261A] shadow-[0_12px_30px_-12px_rgba(245,184,0,0.8)] transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5B800]/40"
                >
                  {t.step1.button}
                </a>
              ) : (
                <>
                  <span
                    aria-disabled="true"
                    className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-[#04261A]/10 px-6 text-base font-bold text-[#04261A]/45"
                  >
                    {t.step1.button}
                  </span>
                  <p className="mt-2 text-xs text-[#04261A]/55">{t.step1.soon}</p>
                </>
              )}
            </div>
          </StepCard>

          <StepCard n={2} title={t.step2.title}>
            <CopyCode code="LEVELUP" label={t.step2.codeLabel} copyLabel={t.step2.copy} copiedLabel={t.step2.copied} />
            {settings.cashbackConfirmed && (
              <p className="mt-4 inline-flex w-fit rounded-full bg-[#5BC693]/20 px-3.5 py-1.5 text-sm font-semibold text-[#0F5132]">
                {t.step2.cashback}
              </p>
            )}
          </StepCard>

          <StepCard n={3} title={t.step3.title}>
            <a
              href="#participer"
              className="mt-auto pt-5 text-sm font-semibold text-[#0F5132] underline decoration-[#F5B800] decoration-2 underline-offset-4 hover:text-[#04261A]"
            >
              {t.cta} ↓
            </a>
          </StepCard>
        </ol>

        {settings.existingUsersConfirmed && (
          <p className="mx-auto mt-5 max-w-xl rounded-2xl bg-white/70 px-5 py-3 text-center text-sm text-[#04261A]/80 ring-1 ring-[#0A3D27]/10">
            {t.existing}
          </p>
        )}

        <section id="participer" className="mx-auto mt-16 max-w-2xl scroll-mt-28">
          <div className="text-center">
            <h2 className="font-display text-4xl font-bold text-[#0A3D27] sm:text-5xl">{t.cta}</h2>
            <span aria-hidden="true" className="mx-auto mt-3 block h-1 w-16 rounded-full bg-gradient-to-r from-[#FFE08A] to-[#F5B800]" />
          </div>
          {full ? (
            <div role="status" className="mt-8 rounded-3xl bg-white p-8 text-center shadow-[0_28px_70px_-32px_rgba(4,38,26,0.55)] ring-1 ring-[#0A3D27]/10">
              <p className="font-display text-3xl font-bold text-[#04261A]">{t.form.fullTitle}</p>
            </div>
          ) : (
            <RegistrationForm locale={loc} />
          )}
        </section>
      </div>
    </div>
  );
}
