'use client';

import { useState } from 'react';
import { TicketingModal } from './TicketingModal';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface TicketingPass {
  id: string;
  name: string;
  label: string;
  targetAudience: string;
  description: string;
  highlights: string; // JSON string
  includes: string;   // JSON string
  decisionPhrase: string;
  priceCents: number;
  oldPriceCents: number | null;
  currency: string;
  status: string; // available | coming_soon | sold_out
  checkoutUrl: string;
  colorPrimary: string;
  colorSecondary: string;
  sortOrder: number;
  availabilityNote: string | null;
}

export interface TicketingConfig {
  pageTitle: string;
  pageSubtitle: string;
  pageIntro: string;
  eventDate: string;
  eventLocation: string;
  ctaButtonText: string;
  checkoutUrl: string;
  passes: TicketingPass[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseJson(raw: string, fallback: string[] = []): string[] {
  try { return JSON.parse(raw); } catch { return fallback; }
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(cents / 100);
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const WHAT_AWAITS = [
  { icon: '🎤', text: 'Keynotes inspirantes animées par des dirigeants et experts reconnus.' },
  { icon: '💬', text: "Panels interactifs autour de la carrière, l'entrepreneuriat, l'investissement et le développement personnel." },
  { icon: '🔬', text: 'Deep Dives en petits groupes pour approfondir le sujet qui correspond à votre parcours.' },
  { icon: '❓', text: "Sessions de questions-réponses avec les intervenants." },
  { icon: '🤝', text: 'Espace networking pour rencontrer recruteurs, entrepreneurs, speakers et partenaires.' },
  { icon: '🏢', text: 'Stands interactifs pour découvrir des entreprises, des opportunités et des projets.' },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function PassCard({
  pass,
}: {
  pass: TicketingPass;
}) {
  const highlights = parseJson(pass.highlights);
  const includes = parseJson(pass.includes);
  const isSoldOut = pass.status === 'sold_out';
  const isComingSoon = pass.status === 'coming_soon';
  const isAvailable = pass.status === 'available';

  return (
    <div
      className={`group relative flex flex-col rounded-3xl ${isSoldOut ? 'opacity-60' : ''}`}
      style={{
        background: `linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.4) 100%)`,
        boxShadow: `0 20px 60px -20px ${pass.colorPrimary}66, 0 0 0 1px ${pass.colorPrimary}40 inset`,
      }}
    >
      {/* Permanent glow accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-0.5 rounded-3xl"
        style={{
          background: `linear-gradient(135deg, ${pass.colorPrimary}55, ${pass.colorSecondary}33)`,
          filter: 'blur(20px)',
          zIndex: -1,
        }}
      />

      {/* Sold out overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/50 backdrop-blur-[2px]">
          <span className="rounded-full border border-white/30 bg-black/60 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white/80">Sold Out</span>
        </div>
      )}

      {/* Top color band */}
      <div
        className="h-1.5 rounded-t-3xl"
        style={{ background: `linear-gradient(90deg, ${pass.colorPrimary}, ${pass.colorSecondary})` }}
      />

      <div className="flex flex-1 flex-col p-7 sm:p-8">
        {/* Header: tier name (left) + price pill (right) — Mboa style */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-2xl font-bold uppercase leading-none tracking-tight text-white sm:text-3xl">
              {pass.name}
            </h3>
            {pass.label && (
              <span
                className="mt-2 inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em]"
                style={{ color: pass.colorSecondary }}
              >
                {pass.label}
              </span>
            )}
          </div>
          {pass.priceCents > 0 && (
            <div className="shrink-0 text-right">
              {pass.oldPriceCents && (
                <div className="mb-1 text-xs text-white/30 line-through">
                  {formatPrice(pass.oldPriceCents, pass.currency)}
                </div>
              )}
              <span
                className="inline-block rounded-2xl px-4 py-2 font-display text-2xl font-bold leading-none text-white shadow-lg sm:text-3xl"
                style={{ background: `linear-gradient(135deg, ${pass.colorPrimary}, ${pass.colorSecondary})` }}
              >
                {formatPrice(pass.priceCents, pass.currency)}
              </span>
            </div>
          )}
        </div>

        {/* Availability sub-label — Mboa "PLACES LIMITÉES" style */}
        {pass.availabilityNote && (
          <p className="mb-4 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-amber-400">
            {pass.availabilityNote}
          </p>
        )}

        {/* Target audience */}
        {pass.targetAudience && (
          <p className="mb-5 text-sm leading-relaxed text-white/55">{pass.targetAudience}</p>
        )}

        {/* Divider */}
        <div
          className="mb-5 h-px w-full"
          style={{ background: `linear-gradient(90deg, ${pass.colorSecondary}66, transparent)` }}
        />

        {/* Feature list — Mboa bullet-dot style inside tinted box */}
        {(highlights.length > 0 || includes.length > 0) && (
          <ul
            className="mb-6 space-y-3 rounded-2xl border border-white/5 p-5"
            style={{ background: `${pass.colorPrimary}12` }}
          >
            {[...highlights, ...includes].map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-white/85">
                <span
                  className="mt-[0.4rem] h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: pass.colorSecondary }}
                />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Decision phrase */}
        {pass.decisionPhrase && (
          <p
            className="mb-5 rounded-xl border-l-2 p-3.5 text-xs italic leading-relaxed text-white/75"
            style={{ background: `${pass.colorPrimary}1f`, borderLeftColor: pass.colorSecondary }}
          >
            {pass.decisionPhrase}
          </p>
        )}

        {/* Status footer (no per-card buy button — single CTA lives below the grid) */}
        <div className="mt-auto pt-2">
          {isAvailable && (
            <div
              className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-sm font-bold"
              style={{
                borderColor: `${pass.colorSecondary}55`,
                background: `${pass.colorPrimary}14`,
                color: pass.colorSecondary,
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: pass.colorSecondary }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: pass.colorSecondary }} />
              </span>
              Disponible à la billetterie
            </div>
          )}
          {isComingSoon && (
            <div className="w-full rounded-2xl border border-white/15 bg-white/[0.03] py-3 text-center text-sm font-bold text-white/45">
              ⏳ Bientôt disponible
            </div>
          )}
          {isSoldOut && (
            <div className="w-full rounded-2xl bg-white/[0.05] py-3 text-center text-sm font-bold text-white/30">
              Sold out
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function NewTicketingPage({ config }: { config: TicketingConfig }) {
  const [modalOpen, setModalOpen] = useState(false);

  const hasCheckout = Boolean(config.checkoutUrl);
  const hasAvailablePass = config.passes.some((p) => p.status === 'available');
  const isOpen = hasCheckout && hasAvailablePass;

  function handleBuy() {
    if (!config.checkoutUrl) return;
    setModalOpen(true);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#120505] text-white">
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
        @media (prefers-reduced-motion: reduce) {
          .lu-no-motion { animation: none !important; }
        }
      `}</style>

      {/* Animated orbs */}
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none fixed -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full bg-[#8C1A1A] opacity-60 blur-[120px]"
        style={{ animation: 'lu-orb-drift-a 18s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none fixed -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full bg-[#E98C0B] opacity-40 blur-[140px]"
        style={{ animation: 'lu-orb-drift-b 22s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none fixed top-1/2 left-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c77409] opacity-25 blur-[110px]"
        style={{ animation: 'lu-orb-drift-c 26s ease-in-out infinite' }}
      />

      {/* Slow conic gradient sweep behind content */}
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none fixed top-1/2 left-1/2 h-[120vmin] w-[120vmin] rounded-full opacity-25"
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
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Twinkling sparkles */}
      <div aria-hidden className="pointer-events-none fixed inset-0">
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
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
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
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-14 pt-20 text-center sm:px-8 sm:pt-28">
        <div className="relative mx-auto max-w-4xl">
          {/* Animated "billetterie ouverte" banner */}
          {isOpen && (
            <div className="mb-9 flex justify-center animate-hero-tagline">
              <div
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full border border-accent/40 px-6 py-3 backdrop-blur-sm"
                style={{
                  background:
                    'linear-gradient(120deg, rgba(233,140,11,0.18), rgba(140,26,26,0.22), rgba(233,140,11,0.18))',
                  boxShadow: '0 0 0 1px rgba(233,140,11,0.25) inset, 0 12px 40px rgba(233,140,11,0.25)',
                }}
              >
                {/* Live pulsing dot */}
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400 shadow-[0_0_10px_2px_rgba(74,222,128,0.6)]" />
                </span>
                {/* Shining animated text */}
                <span
                  className="animate-text-shine bg-clip-text text-sm font-extrabold uppercase tracking-[0.22em] text-transparent sm:text-base"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #f0a530 0%, #ffffff 20%, #f0a530 40%, #f0a530 100%)',
                    backgroundSize: '200% auto',
                  }}
                >
                  La billetterie est ouverte
                </span>
                <span className="text-lg leading-none">🎉</span>
                {/* Shimmer sweep highlight */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/25 to-transparent"
                />
              </div>
            </div>
          )}

          {/* Eyebrow */}
          <p className="mb-5 animate-hero-tagline text-[0.7rem] font-bold uppercase tracking-[0.4em] text-accent/70">
            Level Up in Germany · Billetterie
          </p>

          {/* Title with gradient highlight */}
          <h1 className="mb-6 animate-hero-title font-display text-[2.75rem] font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {config.pageTitle}
          </h1>

          {/* Structured event meta chips */}
          <div className="mb-7 flex animate-hero-subtitle flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur-sm">
              <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {config.eventDate}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur-sm">
              <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
              </svg>
              {config.eventLocation}
            </span>
            {config.passes.length > 0 && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur-sm">
                <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 9.5v1a2 2 0 0 0 0 4v1a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5v-1a2 2 0 0 0 0-4v-1Z" /><path d="M9 8v8" strokeDasharray="2 2" />
                </svg>
                {config.passes.length} formules
              </span>
            )}
          </div>

          {/* Subtitle */}
          {config.pageSubtitle && (
            <p className="mx-auto mb-4 max-w-2xl animate-hero-subtitle text-lg font-medium text-accent/90 sm:text-xl">
              {config.pageSubtitle}
            </p>
          )}

          {/* Intro */}
          {config.pageIntro && (
            <p className="mx-auto mb-10 max-w-3xl animate-hero-subtitle text-base leading-relaxed text-white/60 sm:text-lg">
              {config.pageIntro}
            </p>
          )}

          {/* CTA */}
          <div className="animate-hero-buttons">
            <a
              href="#tickets"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-[#1a0606] shadow-[0_10px_40px_rgba(233,140,11,0.45)] transition hover:bg-accent-light hover:shadow-[0_14px_50px_rgba(233,140,11,0.6)]"
            >
              {config.ctaButtonText}
              <svg className="h-4 w-4 transition-transform group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Decorative divider ──────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto mb-14 flex max-w-xs items-center justify-center gap-3 px-5">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-accent/40" />
        <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-accent/40" />
      </div>

      {/* ── Ce qui vous attend ──────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-accent/70">L'expérience</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Ce qui vous attend</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_AWAITS.map((item, i) => (
              <div
                key={i}
                className="group flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white/[0.05] hover:shadow-[0_8px_24px_rgba(233,140,11,0.1)]"
              >
                <span className="text-2xl transition-transform group-hover:scale-110">{item.icon}</span>
                <p className="text-sm leading-relaxed text-white/75">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Une journée, trois expériences ────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-20 sm:px-8">
        <div
          className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-8 text-center sm:p-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(140,26,26,0.25) 0%, rgba(233,140,11,0.12) 100%)',
            boxShadow: '0 0 0 1px rgba(233,140,11,0.2) inset',
          }}
        >
          <div aria-hidden className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <p className="relative mb-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-accent/80">Le concept</p>
          <h2 className="relative mb-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Une journée, trois expériences
          </h2>
          <p className="relative mx-auto mb-5 max-w-xl text-base leading-relaxed text-white/75">
            Après les conférences du matin, chaque participant rejoint un{' '}
            <strong className="text-accent">Deep Dive exclusif</strong> en fonction du billet choisi.
          </p>
          <div className="relative rounded-2xl border border-accent/25 bg-black/30 px-6 py-4 backdrop-blur-sm">
            <p className="text-sm text-white/85 leading-relaxed">
              <span className="font-bold text-accent">Tous les billets</span> donnent accès à l'ensemble de
              l'événement. Seule la session <strong className="text-white">Deep Dive</strong> varie selon le
              parcours sélectionné.
            </p>
          </div>
        </div>
      </section>

      {/* ── Ticket cards ────────────────────────────────────────────────────── */}
      <section id="tickets" className="relative z-10 scroll-mt-12 px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-accent/70">La billetterie</p>
            <h2 className="font-display text-3xl font-bold uppercase text-white sm:text-5xl">Choisissez votre formule</h2>
            <p className="mt-3 text-base text-white/55">Sélectionnez la formule qui vous correspond.</p>
          </div>

          {config.passes.length === 0 ? (
            <p className="text-center text-white/40">Aucun ticket disponible pour le moment.</p>
          ) : (
            <div className={`grid gap-7 ${config.passes.length === 1 ? 'max-w-md mx-auto' : config.passes.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
              {config.passes.map((pass) => (
                <PassCard key={pass.id} pass={pass} />
              ))}
            </div>
          )}

          {/* Single animated CTA */}
          {isOpen && (
            <div className="mt-14 flex flex-col items-center animate-hero-buttons">
              <button
                onClick={handleBuy}
                className="animate-cta-glow group/cta relative w-full max-w-md overflow-hidden rounded-2xl py-5 text-base font-extrabold text-[#1a0606] transition active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #E98C0B, #f0a530)' }}
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2.5 uppercase tracking-[0.08em]">
                  🎟️ Acheter mon billet
                  <svg className="h-5 w-5 transition-transform group-hover/cta:translate-x-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
                {/* Shimmer sweep */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </button>
              <p className="mt-4 flex items-center gap-2 text-xs font-medium text-white/50">
                <svg className="h-4 w-4 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Paiement 100 % sécurisé · Confirmation immédiate
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Inclus dans tous les tickets ─────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-24 sm:px-8">
        <div
          className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl px-8 py-9 sm:px-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(233,140,11,0.08) 100%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08) inset',
          }}
        >
          {/* corner gradient */}
          <div aria-hidden className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative mb-6 text-center">
            <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-accent/70">Avantages communs</p>
            <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Inclus dans tous les tickets
            </h3>
          </div>
          <ul className="relative grid gap-4 sm:grid-cols-2">
            {[
              { emoji: '🍽️', text: 'Déjeuner inclus.' },
              { emoji: '🥗', text: 'Repas et fingerfood inclus.' },
              { emoji: '☕', text: 'Boissons à volonté toute la journée (eau, café, thé, jus et softs).' },
              { emoji: '🏢', text: "Accès à l'espace exposants et aux partenaires." },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 rounded-2xl bg-black/20 p-4 backdrop-blur-sm">
                <span className="text-2xl">{item.emoji}</span>
                <span className="pt-0.5 text-sm leading-relaxed text-white/85">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Footer signature ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 px-5 pb-10 pt-6 text-center sm:px-8">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-white/30">
          Level Up in Germany · {config.eventDate}
        </p>
      </footer>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {modalOpen && (
        <TicketingModal
          checkoutUrl={config.checkoutUrl}
          passName="Billetterie"
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
