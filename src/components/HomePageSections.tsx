'use client';

import React from 'react';
import Link from 'next/link';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { SectionHeading } from '@/components/SectionHeading';
import { PremiumSurfaceCard } from '@/components/PremiumSurfaceCard';
import { AnimatedStat } from '@/components/AnimatedStat';
import { PhotoStrip } from '@/components/PhotoStrip';
import { EVENT_2025_PHOTOS } from '@/data/gallery';
import type { HomeCopy } from '@/content/home';
import { programHref } from '@/content/home';
import type { Locale } from '@/i18n/config';
import { whoWeAreHref } from '@/lib/whoWeAreRoutes';

function IconUsers() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconRocket() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function IconBriefcase() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

const profileIcons = [<IconUsers key="u" />, <IconRocket key="r" />, <IconBriefcase key="b" />];

// Section "Moments" labels (inline — no need to touch home.ts)
const momentsCopy: Record<Locale, { eyebrow: string; title: string; hint: string }> = {
  de: {
    eyebrow: 'Mega Konferenz 2025',
    title: 'Unsere Gemeinschaft in Bildern',
    hint: 'Ziehen oder wischen zum Blättern',
  },
  en: {
    eyebrow: 'Mega Conference 2025',
    title: 'Our Community in Pictures',
    hint: 'Drag or swipe to explore',
  },
  fr: {
    eyebrow: 'Méga Conférence 2025',
    title: 'Notre communauté en images',
    hint: 'Glisser ou balayer pour explorer',
  },
};

type Props = { t: HomeCopy; base: string; joinWhatsAppUrl: string; locale: Locale };

export function HomePageSections({ t, base, joinWhatsAppUrl, locale }: Props) {
  const moments = momentsCopy[locale];

  return (
    <>
      {/* Problem */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50/80 to-white py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(140,26,26,0.08),transparent)]" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t.problemEyebrow}
              title={t.problemTitle}
              subtitle={t.problemLead}
            />
          </RevealOnScroll>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {t.problemPoints.map((point, i) => (
              <RevealOnScroll key={i} delayMs={i * 80} className="h-full">
                <div className="h-full rounded-2xl border border-gray-100/80 border-t-2 border-t-accent/60 bg-white p-7 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] backdrop-blur-sm card-hover-lift">
                  <span className="text-accent font-display text-3xl font-bold tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="mt-3 text-gray-700 leading-relaxed">{point}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Vision — bold full-bleed statement */}
      <section className="relative py-24 sm:py-36 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark" />
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_25%_15%,rgba(233,140,11,0.28),transparent_48%)]" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_80%_85%,rgba(140,26,26,0.45),transparent_45%)]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Decorative quote mark */}
          <div
            className="pointer-events-none select-none absolute -top-4 left-1/2 -translate-x-1/2 text-[10rem] sm:text-[14rem] font-bold leading-none text-accent/15"
            aria-hidden
          >
            &ldquo;
          </div>
          <RevealOnScroll>
            <p className="relative z-10 text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-accent mb-6">
              {t.visionEyebrow}
            </p>
            <h2 className="relative z-10 font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-tight mb-6 text-balance">
              {t.visionTitle}
            </h2>
            <p className="relative z-10 text-lg sm:text-xl text-white/75 leading-relaxed max-w-2xl mx-auto">
              {t.visionBody}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t.missionEyebrow}
              title={t.missionTitle}
              subtitle={t.missionLead}
              align="left"
            />
          </RevealOnScroll>
          <RevealOnScroll delayMs={60}>
            <ul className="space-y-4 max-w-3xl">
              {t.missionBullets.map((item, i) => (
                <li key={i} className="flex gap-4 items-start">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-bold">
                    ✓
                  </span>
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </RevealOnScroll>
        </div>
      </section>

      {/* 3 profiles */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t.profilesEyebrow}
              title={t.profilesTitle}
              subtitle={t.profilesLead}
            />
          </RevealOnScroll>
          <div className="grid gap-6 md:grid-cols-3 items-stretch">
            {t.profiles.map((p, i) => (
              <RevealOnScroll key={p.title} delayMs={i * 90} className="h-full flex flex-col">
                <PremiumSurfaceCard
                  title={p.title}
                  subtitle={p.role}
                  description={p.body}
                  icon={profileIcons[i]}
                />
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t.programsEyebrow}
              title={t.programsTitle}
              subtitle={t.programsLead}
            />
          </RevealOnScroll>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.programs.map((prog, i) => (
              <RevealOnScroll key={prog.title} delayMs={(i % 3) * 70} className="h-full">
                <PremiumSurfaceCard
                  title={prog.title}
                  description={prog.desc}
                  href={programHref(base, prog.hrefKey)}
                />
              </RevealOnScroll>
            ))}
          </div>
          <RevealOnScroll className="mt-10 text-center">
            <Link
              href={`${base}/events`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors"
            >
              {t.allEventsLink}
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-28 bg-gray-50/70 border-y border-gray-100/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <SectionHeading
              eyebrow={t.impactEyebrow}
              title={t.impactTitle}
              subtitle={t.impactLead}
            />
          </RevealOnScroll>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.values.map((v, i) => (
              <RevealOnScroll key={v.title} delayMs={i * 50} className="h-full">
                <div className="h-full rounded-2xl bg-white border border-gray-100/80 p-7 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_-8px_rgba(140,26,26,0.10)] transition-all duration-300 hover:-translate-y-0.5">
                  <h3 className="font-semibold text-primary">{v.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-primary-dark" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.07'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {t.stats.map((s) => (
              <AnimatedStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      {/* ——— PHOTO GALLERY STRIP ——— */}
      <section className="relative py-20 sm:py-28 bg-brand-dark overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 mb-10">
          <RevealOnScroll>
            {/* Thin accent rule */}
            <div className="flex items-center gap-4 mb-6">
              <span className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                {moments.eyebrow}
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-white text-balance text-center">
              {moments.title}
            </h2>
          </RevealOnScroll>
        </div>

        {/* Full-bleed strip — no horizontal padding */}
        <div className="relative">
          {/* Left fade */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-r from-brand-dark to-transparent" />
          {/* Right fade */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-24 z-10 bg-gradient-to-l from-brand-dark to-transparent" />
          <div className="pl-4 sm:pl-6">
            <PhotoStrip photos={EVENT_2025_PHOTOS} />
          </div>
        </div>

        <p className="mt-6 text-center text-white/30 text-xs tracking-widest uppercase select-none">
          ← {moments.hint} →
        </p>
      </section>

      {/* CTA band */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-white via-orange-50/30 to-white relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold text-brand-dark text-balance">{t.ctaBandTitle}</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t.ctaBandSubtitle}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
              <Link
                href={`${base}/contact`}
                className="inline-flex min-w-[180px] justify-center items-center rounded-full bg-primary px-7 py-4 text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary-light hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t.ctaJoin}
              </Link>
              <Link
                href={whoWeAreHref(locale)}
                className="inline-flex min-w-[180px] justify-center items-center rounded-full border-2 border-primary bg-white px-6 py-3.5 text-primary font-semibold hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t.ctaMentor}
              </Link>
              <Link
                href={`${base}/contact`}
                className="inline-flex min-w-[180px] justify-center items-center rounded-full bg-brand-dark px-6 py-3.5 text-white font-semibold hover:bg-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t.ctaPartner}
              </Link>
              <Link
                href={`${base}/sponsor-donate`}
                className="inline-flex min-w-[180px] justify-center items-center rounded-full border-2 border-accent bg-accent/10 px-6 py-3.5 text-accent-dark font-semibold hover:bg-accent hover:text-white hover:border-accent transition-all duration-300"
              >
                {t.ctaDonate}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
