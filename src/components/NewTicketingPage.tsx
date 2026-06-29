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
  const checkoutUrl = pass.checkoutUrl || globalCheckoutUrl;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border transition-all ${isSoldOut ? 'opacity-70' : 'hover:shadow-2xl hover:-translate-y-1'}`}
      style={{
        background: `linear-gradient(160deg, ${pass.colorPrimary}18 0%, #0f1a0f 100%)`,
        borderColor: `${pass.colorPrimary}55`,
        boxShadow: `0 4px 32px ${pass.colorPrimary}22`,
      }}
    >
      {/* Sold out overlay */}
      {isSoldOut && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px]">
          <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-widest text-white/60 border border-white/20">Sold Out</span>
        </div>
      )}

      {/* Price badge */}
      <div className="absolute -top-3 right-4 z-20">
        <div
          className="rounded-full px-4 py-1.5 text-sm font-bold shadow-lg text-white"
          style={{ background: `linear-gradient(135deg, ${pass.colorPrimary}, ${pass.colorSecondary})` }}
        >
          {pass.priceCents > 0 ? formatPrice(pass.priceCents, pass.currency) : 'Prix à venir'}
          {pass.oldPriceCents && (
            <span className="ml-2 text-[0.65rem] line-through opacity-60">
              {formatPrice(pass.oldPriceCents, pass.currency)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 pt-8">
        {/* Label */}
        <span
          className="mb-2 inline-block self-start rounded-full px-3 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest"
          style={{ background: `${pass.colorPrimary}33`, color: pass.colorSecondary }}
        >
          {pass.label}
        </span>

        {/* Name */}
        <h3 className="mb-1 font-display text-xl font-bold text-white leading-tight">{pass.name}</h3>

        {/* Target */}
        <p className="mb-3 text-xs text-white/50 italic">{pass.targetAudience}</p>

        {/* Description */}
        <p className="mb-5 text-sm text-white/65 leading-relaxed">{pass.description}</p>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/40">
              Vous découvrirez notamment
            </p>
            <ul className="space-y-1.5">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70" style={{ color: pass.colorSecondary }}>
                  <CheckIcon />
                  <span className="text-white/70">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <div className="my-4 h-px w-full" style={{ background: `${pass.colorPrimary}40` }} />

        {/* Includes */}
        {includes.length > 0 && (
          <div className="mb-5">
            <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-widest text-white/40">Inclus</p>
            <ul className="space-y-1">
              {includes.map((inc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/65">
                  <span className="text-xs" style={{ color: pass.colorSecondary }}>✓</span>
                  {inc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Decision phrase */}
        {pass.decisionPhrase && (
          <p
            className="mb-5 rounded-xl p-3 text-xs italic leading-relaxed text-white/70"
            style={{ background: `${pass.colorPrimary}22`, borderLeft: `3px solid ${pass.colorSecondary}` }}
          >
            {pass.decisionPhrase}
          </p>
        )}

        {/* Availability note */}
        {pass.availabilityNote && (
          <p className="mb-3 text-center text-xs font-semibold text-amber-400">{pass.availabilityNote}</p>
        )}

        {/* CTA button */}
        <div className="mt-auto">
          {isAvailable && (
            <button
              onClick={() => onBuy(pass)}
              className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${pass.colorPrimary}, ${pass.colorSecondary})` }}
            >
              Acheter mon billet
            </button>
          )}
          {isComingSoon && (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/20 bg-white/5 py-3 text-sm font-bold text-white/40"
            >
              Bientôt disponible
            </button>
          )}
          {isSoldOut && (
            <button
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-white/10 py-3 text-sm font-bold text-white/30"
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
    <div className="min-h-screen bg-[#080f08] text-white">

      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 pb-20 pt-24 text-center sm:px-8 sm:pt-32">
        {/* Background orbs */}
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-[70vmax] w-[70vmax] -translate-x-1/2 rounded-full bg-[#1a4a2e] opacity-20 blur-[120px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-[40vmax] w-[40vmax] rounded-full bg-[#c8910a] opacity-10 blur-[100px]" />

        <div className="relative mx-auto max-w-4xl">
          {/* Eyebrow badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#2d7a4f]/40 bg-[#1a4a2e]/30 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#4ade80] backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ade80]" />
            </span>
            {config.eventDate} · {config.eventLocation}
          </div>

          {/* Title */}
          <h1 className="mb-4 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
            {config.pageTitle}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mb-6 max-w-2xl text-lg font-medium text-[#4ade80] sm:text-xl">
            {config.pageSubtitle}
          </p>

          {/* Intro */}
          {config.pageIntro && (
            <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-white/60 sm:text-lg">
              {config.pageIntro}
            </p>
          )}

          {/* Anchor CTA */}
          <a
            href="#tickets"
            className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white shadow-xl transition hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #1a4a2e, #2d7a4f)' }}
          >
            {config.ctaButtonText}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>
      </section>

      {/* ── Ce qui vous attend ──────────────────────────────────────────────── */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Ce qui vous attend</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_AWAITS.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition hover:border-[#2d7a4f]/40 hover:bg-[#1a4a2e]/10"
              >
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm leading-relaxed text-white/65">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Une journée, trois expériences ────────────────────────────────── */}
      <section className="px-5 pb-16 sm:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#2d7a4f]/30 bg-[#1a4a2e]/10 p-8 text-center">
          <h2 className="mb-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Une journée, trois expériences
          </h2>
          <p className="mb-4 text-base leading-relaxed text-white/65">
            Après les conférences du matin, chaque participant rejoint un{' '}
            <strong className="text-white">Deep Dive exclusif</strong> en fonction du billet choisi.
          </p>
          <div className="rounded-xl border border-[#4ade80]/20 bg-[#1a4a2e]/30 px-6 py-4">
            <p className="text-sm text-[#4ade80] font-medium">
              ✅ Tous les billets donnent accès à l'ensemble de l'événement.{' '}
              <span className="text-white/70">Seule la session Deep Dive varie selon le parcours sélectionné.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Ticket cards ────────────────────────────────────────────────────── */}
      <section id="tickets" className="px-5 pb-24 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Choisir votre parcours</h2>
            <p className="mt-2 text-base text-white/50">Sélectionnez le billet qui correspond à votre objectif.</p>
          </div>

          {config.passes.length === 0 ? (
            <p className="text-center text-white/40">Aucun ticket disponible pour le moment.</p>
          ) : (
            <div className={`grid gap-8 ${config.passes.length === 1 ? 'max-w-md mx-auto' : config.passes.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
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
