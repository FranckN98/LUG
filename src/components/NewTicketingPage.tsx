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

const CheckIcon = () => (
  <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

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
  globalCheckoutUrl,
  onBuy,
}: {
  pass: TicketingPass;
  globalCheckoutUrl: string;
  onBuy: (pass: TicketingPass) => void;
}) {
  const highlights = parseJson(pass.highlights);
  const includes = parseJson(pass.includes);
  const isSoldOut = pass.status === 'sold_out';
  const isComingSoon = pass.status === 'coming_soon';
  const isAvailable = pass.status === 'available';

  return (
    <div
      className={`group relative flex flex-col rounded-3xl transition-all duration-500 ${isSoldOut ? 'opacity-60' : 'hover:-translate-y-2'}`}
      style={{
        background: `linear-gradient(165deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.4) 100%)`,
        boxShadow: `0 20px 60px -20px ${pass.colorPrimary}66, 0 0 0 1px ${pass.colorPrimary}40 inset`,
      }}
    >
      {/* Glow accent on hover */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-0.5 rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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

      <div className="flex flex-1 flex-col p-7">
        {/* Header row: label + price */}
        <div className="mb-5 flex items-start justify-between gap-3">
          <span
            className="inline-block rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-white shadow-sm"
            style={{ background: pass.colorSecondary }}
          >
            {pass.label}
          </span>
          {pass.priceCents > 0 && (
            <div className="text-right">
              {pass.oldPriceCents && (
                <div className="text-xs text-white/30 line-through leading-none">
                  {formatPrice(pass.oldPriceCents, pass.currency)}
                </div>
              )}
              <div
                className="font-display text-3xl font-bold leading-none"
                style={{ color: pass.colorSecondary }}
              >
                {formatPrice(pass.priceCents, pass.currency)}
              </div>
            </div>
          )}
        </div>

        {/* Name + target */}
        <h3 className="mb-1.5 font-display text-2xl font-bold text-white leading-tight">{pass.name}</h3>
        <p className="mb-6 text-sm text-white/55 leading-relaxed">{pass.targetAudience}</p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="mb-6">
            <p className="mb-3 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/45">
              <span className="h-px w-6" style={{ background: pass.colorSecondary }} />
              Vous découvrirez
            </p>
            <ul className="space-y-2">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <span className="mt-0.5 shrink-0" style={{ color: pass.colorSecondary }}>
                    <CheckIcon />
                  </span>
                  <span className="text-white/80">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Includes */}
        {includes.length > 0 && (
          <div className="mb-6 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <p className="mb-2.5 flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/45">
              <span className="h-px w-6" style={{ background: pass.colorSecondary }} />
              Inclus
            </p>
            <ul className="space-y-1.5">
              {includes.map((inc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/75">
                  <span className="text-sm font-bold" style={{ color: pass.colorSecondary }}>✓</span>
                  {inc}
                </li>
              ))}
            </ul>
          </div>
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

        {pass.availabilityNote && (
          <p className="mb-3 text-center text-xs font-semibold text-amber-400">⚡ {pass.availabilityNote}</p>
        )}

        {/* CTA button */}
        <div className="mt-auto pt-2">
          {isAvailable && (
            <button
              onClick={() => onBuy(pass)}
              className="group/btn relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${pass.colorPrimary}, ${pass.colorSecondary})` }}
            >
              <span className="relative z-10 inline-flex items-center justify-center gap-2">
                Acheter mon billet
                <svg className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 transition-opacity group-hover/btn:opacity-100"
                style={{ background: `linear-gradient(135deg, ${pass.colorSecondary}, ${pass.colorPrimary})` }}
              />
            </button>
          )}
          {isComingSoon && (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-2xl border border-white/15 bg-white/[0.03] py-3.5 text-sm font-bold text-white/45"
            >
              ⏳ Bientôt disponible
            </button>
          )}
          {isSoldOut && (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-2xl bg-white/[0.05] py-3.5 text-sm font-bold text-white/30"
            >
              Sold out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function NewTicketingPage({ config }: { config: TicketingConfig }) {
  const [modalPass, setModalPass] = useState<TicketingPass | null>(null);

  function handleBuy(pass: TicketingPass) {
    const url = pass.checkoutUrl || config.checkoutUrl;
    if (!url) return;
    setModalPass(pass);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0505] text-white">
      {/* Page-wide brand-aligned background: deep burgundy → black with gold accent */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse at top, rgba(140,26,26,0.25) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(233,140,11,0.12) 0%, transparent 55%), #0a0505',
        }}
      />
      {/* Subtle dot grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-28">
        <div className="relative mx-auto max-w-4xl">
          {/* Eyebrow badge */}
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-accent backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            {config.eventDate} · {config.eventLocation}
          </div>

          {/* Title */}
          <h1 className="mb-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {config.pageTitle}
          </h1>

          {/* Decorative divider */}
          <div className="mx-auto mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent/60" />
            <span className="h-1.5 w-1.5 rotate-45 bg-accent" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent/60" />
          </div>

          {/* Subtitle */}
          <p className="mx-auto mb-6 max-w-2xl text-lg font-medium text-accent/90 sm:text-xl">
            {config.pageSubtitle}
          </p>

          {/* Intro */}
          {config.pageIntro && (
            <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-white/65 sm:text-lg">
              {config.pageIntro}
            </p>
          )}

          {/* Anchor CTA */}
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
      </section>

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
            <p className="mb-2 text-[0.7rem] font-bold uppercase tracking-[0.3em] text-accent/70">Les billets</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">Choisir votre parcours</h2>
            <p className="mt-3 text-base text-white/55">Sélectionnez le billet qui correspond à votre objectif.</p>
          </div>

          {config.passes.length === 0 ? (
            <p className="text-center text-white/40">Aucun ticket disponible pour le moment.</p>
          ) : (
            <div className={`grid gap-7 ${config.passes.length === 1 ? 'max-w-md mx-auto' : config.passes.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
              {config.passes.map((pass) => (
                <PassCard
                  key={pass.id}
                  pass={pass}
                  globalCheckoutUrl={config.checkoutUrl}
                  onBuy={handleBuy}
                />
              ))}
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
      {modalPass && (
        <TicketingModal
          checkoutUrl={modalPass.checkoutUrl || config.checkoutUrl}
          passName={modalPass.name}
          onClose={() => setModalPass(null)}
        />
      )}
    </div>
  );
}
