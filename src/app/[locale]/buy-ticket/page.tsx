import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';
import { prisma } from '@/lib/prisma';
import { NewTicketingPage } from '@/components/NewTicketingPage';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/buy-ticket');
}

type Copy = {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  note: string;
  ctaEvents: string;
  ctaHome: string;
  badge: string;
};

const content: Record<Locale, Copy> = {
  de: {
    eyebrow: 'Ticketing in Vorbereitung',
    title: 'Bald',
    highlight: 'verfügbar',
    subtitle:
      'Die Ticketing-Plattform wird gerade vorbereitet. In wenigen Tagen kannst du deinen Platz für die Level Up in Germany Konferenz sichern.',
    note: 'Verpasse nichts — folge uns auf Instagram und LinkedIn.',
    ctaEvents: 'Veranstaltungen ansehen',
    ctaHome: 'Zur Startseite',
    badge: 'Coming Soon',
  },
  en: {
    eyebrow: 'Ticketing in preparation',
    title: 'Coming',
    highlight: 'soon',
    subtitle:
      'Our ticketing platform is being prepared. In a few days you will be able to grab your seat for the Level Up in Germany conference.',
    note: 'Don\u2019t miss it — follow us on Instagram and LinkedIn.',
    ctaEvents: 'View events',
    ctaHome: 'Back to home',
    badge: 'Coming Soon',
  },
  fr: {
    eyebrow: 'Billetterie en préparation',
    title: 'Bientôt',
    highlight: 'disponible',
    subtitle:
      'La plateforme de billetterie arrive très vite. Dans quelques jours, tu pourras réserver ta place pour la conférence Level Up in Germany.',
    note: 'Pour ne rien rater, suis-nous sur Instagram et LinkedIn.',
    ctaEvents: 'Voir les événements',
    ctaHome: 'Retour à l\u2019accueil',
    badge: 'Coming Soon',
  },
};

export default async function BuyTicketPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;

  // Check if the new ticketing experience is enabled
  let ticketingConfig = null;
  try {
    ticketingConfig = await prisma.ticketingConfig.findUnique({
      where: { id: 'singleton' },
      include: {
        passes: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  } catch {
    // DB not yet migrated in dev — fall back to coming-soon page
  }

  if (ticketingConfig?.isNewTicketingActive) {
    const resolvedCheckoutUrl =
      ticketingConfig.ticketingProvider === 'weezevent'
        ? ticketingConfig.weezeventUrl
        : ticketingConfig.checkoutUrl;

    return (
      <NewTicketingPage
        config={{
          pageTitle: ticketingConfig.pageTitle,
          pageSubtitle: ticketingConfig.pageSubtitle,
          pageIntro: ticketingConfig.pageIntro,
          eventDate: ticketingConfig.eventDate,
          eventLocation: ticketingConfig.eventLocation,
          ctaButtonText: ticketingConfig.ctaButtonText,
          checkoutUrl: resolvedCheckoutUrl,
          videoUrl: ticketingConfig.videoUrl,
          passes: ticketingConfig.passes,
        }}
      />
    );
  }

  // ── Original coming-soon page ────────────────────────────────────────────────
  const t = content[loc];

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-[#120505] text-white">
      <style>{`
        @keyframes lu-orb-drift-a {
          0%, 100% { transform: translate3d(-10%, -10%, 0) scale(1); }
          50% { transform: translate3d(15%, 5%, 0) scale(1.15); }
        }
        @keyframes lu-orb-drift-b {
          0%, 100% { transform: translate3d(20%, 0%, 0) scale(1.1); }
          50% { transform: translate3d(-15%, 20%, 0) scale(0.95); }
        }
        @keyframes lu-orb-drift-c {
          0%, 100% { transform: translate3d(-5%, 25%, 0) scale(0.9); }
          50% { transform: translate3d(10%, -10%, 0) scale(1.2); }
        }
        @keyframes lu-conic-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes lu-float {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
        @keyframes lu-pulse-ring {
          0% { transform: scale(0.85); opacity: 0.55; }
          80% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes lu-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes lu-rise {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes lu-twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.4); }
        }
        @keyframes lu-ticket-float {
          0% { transform: translateY(110vh) rotate(-12deg); opacity: 0; }
          10% { opacity: 0.18; }
          90% { opacity: 0.18; }
          100% { transform: translateY(-20vh) rotate(8deg); opacity: 0; }
        }
        .lu-rise { animation: lu-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; }
        .lu-shimmer-text {
          background: linear-gradient(
            90deg,
            #ffffff 0%,
            #ffd58a 25%,
            #E98C0B 50%,
            #ffd58a 75%,
            #ffffff 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: lu-shimmer 6s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .lu-no-motion { animation: none !important; }
        }
      `}</style>

      {/* Animated orbs */}
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none absolute -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full bg-[#8C1A1A] opacity-60 blur-[120px]"
        style={{ animation: 'lu-orb-drift-a 18s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full bg-[#E98C0B] opacity-40 blur-[140px]"
        style={{ animation: 'lu-orb-drift-b 22s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none absolute top-1/2 left-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c77409] opacity-25 blur-[110px]"
        style={{ animation: 'lu-orb-drift-c 26s ease-in-out infinite' }}
      />

      {/* Slow conic gradient sweep behind content */}
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none absolute top-1/2 left-1/2 h-[120vmin] w-[120vmin] rounded-full opacity-25"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(233,140,11,0.35) 40deg, transparent 80deg, transparent 200deg, rgba(140,26,26,0.5) 250deg, transparent 290deg)',
          animation: 'lu-conic-spin 40s linear infinite',
          filter: 'blur(40px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Twinkling sparkles */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          { top: '12%', left: '18%', delay: '0s' },
          { top: '22%', left: '78%', delay: '1.4s' },
          { top: '35%', left: '42%', delay: '2.8s' },
          { top: '58%', left: '12%', delay: '0.6s' },
          { top: '67%', left: '88%', delay: '3.2s' },
          { top: '78%', left: '36%', delay: '1.9s' },
          { top: '84%', left: '64%', delay: '0.3s' },
          { top: '15%', left: '52%', delay: '2.2s' },
          { top: '48%', left: '92%', delay: '3.6s' },
          { top: '92%', left: '20%', delay: '1.1s' },
        ].map((s, i) => (
          <span
            key={i}
            className="lu-no-motion absolute h-1 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              top: s.top,
              left: s.left,
              animation: `lu-twinkle 4.5s ease-in-out ${s.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* Floating ticket icons rising in background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { left: '8%', delay: '0s', duration: '24s', size: 42 },
          { left: '28%', delay: '6s', duration: '28s', size: 36 },
          { left: '50%', delay: '12s', duration: '22s', size: 48 },
          { left: '72%', delay: '3s', duration: '30s', size: 34 },
          { left: '88%', delay: '9s', duration: '26s', size: 40 },
        ].map((tk, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="lu-no-motion absolute text-[#E98C0B]"
            width={tk.size}
            height={tk.size}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            style={{
              left: tk.left,
              top: 0,
              animation: `lu-ticket-float ${tk.duration} linear ${tk.delay} infinite`,
            }}
          >
            <path d="M3 9.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 9.5v1a2 2 0 0 0 0 4v1a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5v-1a2 2 0 0 0 0-4v-1Z" />
            <path d="M9 8v8" strokeDasharray="2 2" />
          </svg>
        ))}
      </div>

      {/* Vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* CONTENT */}
      <main className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 py-16 sm:px-8">
        <div className="mx-auto w-full max-w-2xl text-center">
          {/* Pulse badge */}
          <div className="lu-rise mb-8 inline-flex items-center" style={{ animationDelay: '0.05s' }}>
            <span className="relative inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-accent backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span
                  className="lu-no-motion absolute inline-flex h-full w-full rounded-full bg-accent"
                  style={{ animation: 'lu-pulse-ring 2s ease-out infinite' }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {t.badge}
            </span>
          </div>

          {/* Eyebrow */}
          <p
            className="lu-rise mb-4 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-white/55"
            style={{ animationDelay: '0.15s' }}
          >
            {t.eyebrow}
          </p>

          {/* Ticket icon with halo + float */}
          <div
            className="lu-rise mx-auto mb-6 flex h-20 w-20 items-center justify-center"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="relative">
              <span
                aria-hidden
                className="lu-no-motion absolute inset-0 -m-3 rounded-full bg-accent/30 blur-2xl"
                style={{ animation: 'lu-pulse-ring 3s ease-out infinite' }}
              />
              <span
                aria-hidden
                className="absolute inset-0 -m-3 rounded-full"
                style={{
                  background:
                    'radial-gradient(circle, rgba(233,140,11,0.45) 0%, transparent 70%)',
                }}
              />
              <div
                className="lu-no-motion relative flex h-20 w-20 items-center justify-center rounded-2xl border border-accent/40 bg-gradient-to-br from-[#2a0d0d] to-[#1a0606] shadow-[0_0_40px_rgba(233,140,11,0.35)]"
                style={{ animation: 'lu-float 4.5s ease-in-out infinite' }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-accent"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 9.5v1a2 2 0 0 0 0 4v1a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5v-1a2 2 0 0 0 0-4v-1Z" />
                  <path d="M9 8v8" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="lu-rise font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl"
            style={{ animationDelay: '0.3s' }}
          >
            <span className="block text-white">{t.title}</span>
            <span className="lu-shimmer-text lu-no-motion block italic">{t.highlight}</span>
          </h1>

          {/* Divider */}
          <div
            className="lu-rise mx-auto mt-8 flex items-center justify-center gap-3"
            style={{ animationDelay: '0.4s' }}
          >
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent/60" />
            <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent/60" />
          </div>

          {/* Subtitle */}
          <p
            className="lu-rise mx-auto mt-6 max-w-xl text-base text-white/70 sm:text-lg"
            style={{ animationDelay: '0.5s' }}
          >
            {t.subtitle}
          </p>

          {/* Note */}
          <p
            className="lu-rise mt-3 text-sm text-white/45"
            style={{ animationDelay: '0.6s' }}
          >
            {t.note}
          </p>

          {/* CTAs */}
          <div
            className="lu-rise mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: '0.7s' }}
          >
            <Link
              href={`/${loc}/events`}
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-[#1a0606] shadow-[0_8px_30px_rgba(233,140,11,0.45)] transition hover:bg-accent-light hover:shadow-[0_10px_40px_rgba(233,140,11,0.6)]"
            >
              {t.ctaEvents}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 transition group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
            <Link
              href={`/${loc}`}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white/85 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
            >
              {t.ctaHome}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
