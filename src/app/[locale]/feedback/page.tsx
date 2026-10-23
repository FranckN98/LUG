import type { Metadata } from 'next';
import { FEEDBACK_PHOTOS } from '@/config/feedbackPhotos';
import { feedbackCopy as t } from '@/content/feedback';
import { locales, type Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo';
import { FeedbackForm } from './_components/FeedbackForm';
import { PhotoCollage } from './_components/PhotoCollage';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const loc: Locale = locales.includes(locale as Locale) ? (locale as Locale) : 'fr';
  return {
    ...buildPageMetadata(loc, '/feedback', { ...t.seo, noindex: true }),
    // Le lien personnel contient le code : il ne doit jamais partir dans un en-tête Referer.
    referrer: 'no-referrer',
  };
}

export default async function FeedbackPage({ params }: Props) {
  const { locale } = await params;
  const loc: Locale = locales.includes(locale as Locale) ? (locale as Locale) : 'fr';
  const hasPhotos = FEEDBACK_PHOTOS.length > 0;

  return (
    <div lang="fr" className="bg-[#FBF7F4]">
      <section className="relative isolate overflow-hidden text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-20 bg-gradient-to-br from-[#110808] via-primary-dark to-primary" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(233,140,11,0.30),transparent_45%),radial-gradient(circle_at_90%_85%,rgba(233,140,11,0.16),transparent_40%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-6 right-2 -z-10 select-none text-[9rem] font-black leading-none tracking-tighter text-white/[0.05] sm:text-[15rem]"
        >
          2<span className="text-[0.5em] align-top">e</span>
        </div>

        <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${hasPhotos ? 'pt-6 sm:pt-8' : 'pt-16 sm:pt-20'} pb-28 sm:pb-36`}>
          {hasPhotos && <PhotoCollage photos={FEEDBACK_PHOTOS} />}

          <div className={hasPhotos ? 'mt-8 sm:mt-10' : ''}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent-light sm:text-sm">{t.kicker}</p>
            <h1 className="mt-3 max-w-3xl font-display text-5xl font-bold leading-[1.02] sm:text-6xl md:text-7xl">
              {t.title}
              <span className="mt-4 block h-1.5 w-24 rounded-full bg-accent" aria-hidden="true" />
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">{t.intro}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {t.badges.map((b) => (
                <li
                  key={b}
                  className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90 backdrop-blur"
                >
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-16 max-w-2xl px-4 pb-20 sm:-mt-24 sm:pb-28">
        <FeedbackForm homeHref={`/${loc}`} />
      </div>
    </div>
  );
}
