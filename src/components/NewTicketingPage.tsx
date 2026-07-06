'use client';

import { useState } from 'react';
import type { CSSProperties } from 'react';
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
      className={`group relative flex flex-col rounded-3xl bg-white transition-transform duration-300 hover:-translate-y-1 ${isSoldOut ? 'opacity-70' : ''}`}
      style={{
        boxShadow: `0 24px 60px -24px ${pass.colorPrimary}55, 0 0 0 1px ${pass.colorPrimary}22`,
      }}
    >
      {/* Sold out overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/60 backdrop-blur-[2px]">
          <span className="rounded-full border border-black/10 bg-white px-5 py-2 text-sm font-bold uppercase tracking-widest text-neutral-500 shadow">Sold Out</span>
        </div>
      )}

      {/* Top color band */}
      <div
        className="h-1.5 rounded-t-3xl"
        style={{ background: `linear-gradient(90deg, ${pass.colorPrimary}, ${pass.colorSecondary})` }}
      />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Header: tier name (left) + price pill (right) — Mboa style */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-bold uppercase leading-none tracking-tight text-neutral-900 sm:text-2xl">
              {pass.name}
            </h3>
            {pass.label && (
              <span
                className="mt-2 inline-block text-[0.7rem] font-bold uppercase tracking-[0.2em]"
                style={{ color: pass.colorPrimary }}
              >
                {pass.label}
              </span>
            )}
          </div>
          {pass.priceCents > 0 && (
            <div className="shrink-0 text-right">
              {pass.oldPriceCents && (
                <div className="mb-1 text-xs text-neutral-400 line-through">
                  {formatPrice(pass.oldPriceCents, pass.currency)}
                </div>
              )}
              <span
                className="inline-block rounded-xl px-3.5 py-1.5 font-display text-xl font-bold leading-none text-white shadow-lg sm:text-2xl"
                style={{ background: `linear-gradient(135deg, ${pass.colorPrimary}, ${pass.colorSecondary})` }}
              >
                {formatPrice(pass.priceCents, pass.currency)}
              </span>
            </div>
          )}
        </div>

        {/* Availability sub-label — Mboa "PLACES LIMITÉES" style */}
        {pass.availabilityNote && (
          <p className="mb-2.5 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-amber-600">
            {pass.availabilityNote}
          </p>
        )}

        {/* Target audience */}
        {pass.targetAudience && (
          <p className="mb-3 text-sm leading-relaxed text-neutral-500">{pass.targetAudience}</p>
        )}

        {/* Divider */}
        <div
          className="mb-3 h-px w-full"
          style={{ background: `linear-gradient(90deg, ${pass.colorSecondary}55, transparent)` }}
        />

        {/* Feature list — Mboa bullet-dot style inside tinted box */}
        {(highlights.length > 0 || includes.length > 0) && (
          <ul
            className="mb-4 space-y-2 rounded-2xl p-4"
            style={{ background: `${pass.colorPrimary}0d` }}
          >
            {[...highlights, ...includes].map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[0.8rem] leading-snug text-neutral-700">
                <span
                  className="mt-[0.35rem] h-1.5 w-1.5 shrink-0 rounded-full"
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
            className="mb-3 rounded-xl border-l-2 p-3 text-xs italic leading-snug text-neutral-600"
            style={{ background: `${pass.colorPrimary}12`, borderLeftColor: pass.colorSecondary }}
          >
            {pass.decisionPhrase}
          </p>
        )}

        {/* Status footer (no per-card buy button — single CTA lives below the grid) */}
        {(isComingSoon || isSoldOut) && (
          <div className="mt-auto pt-1">
            {isComingSoon && (
              <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 text-center text-sm font-bold text-neutral-400">
                ⏳ Bientôt disponible
              </div>
            )}
            {isSoldOut && (
              <div className="w-full rounded-xl bg-neutral-100 py-2.5 text-center text-sm font-bold text-neutral-400">
                Sold out
              </div>
            )}
          </div>
        )}
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
    <div className="relative min-h-screen overflow-hidden bg-white text-neutral-900">
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
        @keyframes lu-letter-wave {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-0.32em); }
        }
        @media (prefers-reduced-motion: reduce) {
          .lu-no-motion { animation: none !important; }
          .lu-letter { animation: none !important; }
        }
        /* Hero : largeur conservee, hauteur reduite de 15% (recadrage centre) */
        .lu-hero-img { width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; aspect-ratio: 828 / 765; }
        @media (min-width: 640px) { .lu-hero-img { aspect-ratio: 1600 / 574; } }
        @media (min-width: 1024px) { .lu-hero-img { aspect-ratio: 1280 / 510; } }
        /* Grille des tickets : 1 col (mobile) · 2 col (tablette) · N col (desktop) */
        .lu-tickets-grid { grid-template-columns: 1fr; }
        @media (min-width: 640px) {
          .lu-tickets-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (min-width: 1024px) {
          .lu-tickets-grid { grid-template-columns: repeat(var(--lu-cols, 3), minmax(0, 1fr)); }
        }
      `}</style>

      {/* Animated orbs */}
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none fixed -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full bg-[#8C1A1A] opacity-[0.10] blur-[120px]"
        style={{ animation: 'lu-orb-drift-a 18s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none fixed -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full bg-[#E98C0B] opacity-[0.12] blur-[140px]"
        style={{ animation: 'lu-orb-drift-b 22s ease-in-out infinite' }}
      />
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none fixed top-1/2 left-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c77409] opacity-[0.08] blur-[110px]"
        style={{ animation: 'lu-orb-drift-c 26s ease-in-out infinite' }}
      />

      {/* Slow conic gradient sweep behind content */}
      <div
        aria-hidden
        className="lu-no-motion pointer-events-none fixed top-1/2 left-1/2 h-[120vmin] w-[120vmin] rounded-full opacity-[0.12]"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, rgba(233,140,11,0.5) 40deg, transparent 80deg, transparent 200deg, rgba(140,26,26,0.4) 250deg, transparent 290deg)',
          animation: 'lu-conic-spin 40s linear infinite',
          filter: 'blur(40px)',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(rgba(0,0,0,0.9) 1px, transparent 1px)',
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
            className="lu-no-motion absolute h-1 w-1 rounded-full bg-accent shadow-[0_0_8px_rgba(233,140,11,0.6)]"
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
            className="lu-no-motion absolute text-[#E98C0B] opacity-[0.10]"
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

      {/* Vignette (soft light) */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 55%, rgba(255,255,255,0.85) 100%)',
        }}
      />

      {/* ── Hero image responsive (maquette en haut : mobile · tablette · desktop) ── */}
      <section className="relative z-10 px-4 pt-6 sm:px-6 sm:pt-8">
        <a href="#tickets" className="group mx-auto block max-w-5xl overflow-hidden rounded-2xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.35)]" aria-label="Voir les billets">
          <picture>
            {/* Ordinateur */}
            <source media="(min-width: 1024px)" srcSet="/hero/billetterie-desktop.jpeg" />
            {/* Tablette */}
            <source media="(min-width: 640px)" srcSet="/hero/billetterie-tablette.jpeg" />
            {/* Téléphone (portrait) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hero/billetterie-mobile.jpeg"
              alt="Level Up in Germany — La billetterie est ouverte"
              className="lu-hero-img"
              fetchPriority="high"
            />
          </picture>
        </a>

        {/* CTA animé sous l'image */}
        <div className="flex justify-center px-5 py-10">
          <a
            href="#tickets"
            className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-white shadow-[0_10px_40px_rgba(140,26,26,0.45)] transition hover:bg-[#a11f1f] hover:shadow-[0_14px_50px_rgba(140,26,26,0.6)] animate-cta-glow"
          >
            🎟️ Voir les billets
            <svg className="h-4 w-4 transition-transform group-hover:translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* ══ Tickets, includes & footer ═════════════════════════════════════════ */}
      <div className="relative z-10 overflow-hidden">
        {/* Local animated floating tickets (kept subtle on light bg) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {[
            { left: '6%', delay: '0s', duration: '26s', size: 40 },
            { left: '32%', delay: '7s', duration: '30s', size: 32 },
            { left: '58%', delay: '13s', duration: '24s', size: 46 },
            { left: '80%', delay: '4s', duration: '32s', size: 34 },
          ].map((tk, i) => (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className="lu-no-motion absolute text-[#E98C0B] opacity-[0.09]"
              width={tk.size}
              height={tk.size}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              style={{ left: tk.left, top: 0, animation: `lu-ticket-float ${tk.duration} linear ${tk.delay} infinite` }}
            >
              <path d="M3 9.5a1.5 1.5 0 0 1 1.5-1.5h15A1.5 1.5 0 0 1 21 9.5v1a2 2 0 0 0 0 4v1a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 15.5v-1a2 2 0 0 0 0-4v-1Z" />
              <path d="M9 8v8" strokeDasharray="2 2" />
            </svg>
          ))}
        </div>
        {/* Warm ambient glows */}
        <div aria-hidden className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-32 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

        {/* ── Ticket cards ────────────────────────────────────────────────────── */}
        <section id="tickets" className="relative z-10 scroll-mt-12 px-5 pb-16 pt-16 sm:px-8 sm:pt-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-accent">La billetterie</p>
              <h2 className="font-display text-3xl font-bold uppercase text-neutral-900 sm:text-5xl">Choisissez votre formule</h2>
              <p className="mt-3 text-base text-neutral-500">Sélectionnez la formule qui vous correspond.</p>
            </div>

            {config.passes.length === 0 ? (
              <p className="text-center text-neutral-400">Aucun ticket disponible pour le moment.</p>
            ) : (
              <div
                className="lu-tickets-grid grid gap-5 sm:gap-6"
                style={{ ['--lu-cols' as string]: config.passes.length } as CSSProperties}
              >
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
                  className="animate-cta-glow group/cta relative w-full max-w-md overflow-hidden rounded-2xl py-5 text-base font-extrabold text-white transition active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #6f1414, #8C1A1A)' }}
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
                <p className="mt-4 flex items-center gap-2 text-xs font-medium text-neutral-500">
                  <svg className="h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl px-6 py-8 sm:px-10 sm:py-9"
            style={{
              background: 'linear-gradient(135deg, #fff 0%, rgba(233,140,11,0.08) 100%)',
              boxShadow: '0 0 0 1px rgba(233,140,11,0.15) inset, 0 20px 50px -25px rgba(0,0,0,0.3)',
            }}
          >
            {/* corner gradient */}
            <div aria-hidden className="absolute -top-12 -left-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative mb-6 text-center">
              <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-accent">Avantages communs</p>
              <h3 className="font-display text-2xl font-bold text-neutral-900 sm:text-3xl">
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
                <li key={i} className="flex items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 shadow-sm">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="pt-0.5 text-sm leading-relaxed text-neutral-700">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Footer signature ─────────────────────────────────────────────────── */}
        <footer className="relative z-10 border-t border-black/5 px-5 pb-10 pt-6 text-center sm:px-8">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-neutral-400">
            Level Up in Germany · {config.eventDate}
          </p>
        </footer>
      </div>

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
