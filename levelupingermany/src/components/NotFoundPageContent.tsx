'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/config';

function detectLocale(pathname: string | null): Locale {
  const m = pathname?.match(/^\/(de|en|fr)(\/|$)/);
  return m && locales.includes(m[1] as Locale) ? (m[1] as Locale) : 'en';
}

const copy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    description: string;
    home: string;
    events: string;
    hint: string;
  }
> = {
  de: {
    eyebrow: 'Fehler 404',
    title: 'Diese Seite gibt es nicht',
    description:
      'Der Link ist ung\u00fcltig oder die Seite wurde verschoben. Zur\u00fcck zur Startseite oder zu unseren Events?',
    home: 'Zur Startseite',
    events: 'Events',
    hint: 'Level Up in Germany',
  },
  en: {
    eyebrow: 'Error 404',
    title: 'This page does not exist',
    description:
      'The link may be broken or the page has moved. Go back home or explore our events.',
    home: 'Back to home',
    events: 'Events',
    hint: 'Level Up in Germany',
  },
  fr: {
    eyebrow: 'Erreur 404',
    title: 'Cette page n\u2019existe pas',
    description:
      'Le lien est peut-\u00eatre incorrect ou la page a \u00e9t\u00e9 d\u00e9plac\u00e9e. Retour \u00e0 l\u2019accueil ou vers nos \u00e9v\u00e9nements.',
    home: 'Accueil',
    events: '\u00c9v\u00e9nements',
    hint: 'Level Up in Germany',
  },
};

export function NotFoundPageContent() {
  const pathname = usePathname();
  const locale = detectLocale(pathname);
  const t = copy[locale];
  const base = `/${locale}`;

  return (
    <div className="relative flex min-h-[min(70vh,720px)] w-full flex-col items-center justify-center overflow-hidden px-4 py-16 sm:px-6">
      {/* Fond thème : halos primary / accent */}
      <div
        className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-primary/15 blur-[100px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/20 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-dark/[0.04] blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-lg text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-primary/90">{t.eyebrow}</p>

        <div className="mt-4 flex justify-center">
          <span
            className="select-none bg-gradient-to-br from-primary via-primary-light to-accent bg-clip-text text-7xl font-black leading-none tracking-tight text-transparent sm:text-8xl"
            aria-hidden
          >
            404
          </span>
        </div>

        <div className="mt-8 rounded-2xl border border-gray-200/90 bg-white/70 px-6 py-8 shadow-[0_20px_50px_-20px_rgba(140,26,26,0.15)] backdrop-blur-md sm:px-8">
          <h1 className="text-xl font-bold text-brand-dark sm:text-2xl">{t.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">{t.description}</p>

          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              href={base}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-light hover:shadow-primary/35"
            >
              {t.home}
            </Link>
            <Link
              href={`${base}/events`}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-accent/80 bg-accent/10 px-6 py-3 text-sm font-semibold text-accent-dark transition hover:border-accent hover:bg-accent/20"
            >
              {t.events}
            </Link>
          </div>
        </div>

        <p className="mt-8 text-xs text-gray-500">{t.hint}</p>
      </div>
    </div>
  );
}
