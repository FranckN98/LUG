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
import { BusinessTourVideoPlayer } from '@/components/BusinessTourVideoPlayer';

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

type Props = {
  t: HomeCopy;
  base: string;
  joinWhatsAppUrl: string;
  locale: Locale;
  communityPhotos?: Array<{ src: string; alt?: string }>;
};

export function HomePageSections({ t, base, joinWhatsAppUrl, locale, communityPhotos }: Props) {
  const moments = momentsCopy[locale];
  const photos = communityPhotos && communityPhotos.length > 0 ? communityPhotos : EVENT_2025_PHOTOS;

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

      {/* Level Up Business Tour */}
      <section className="relative py-24 sm:py-36 overflow-hidden bg-[#0c0c0c] text-white">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-[0.06] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%221%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_80%_50%,rgba(233,140,11,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_10%_30%,rgba(140,26,26,0.18),transparent)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left: text (5 cols) */}
            <div className="lg:col-span-5">
              <RevealOnScroll>
                <span className="inline-block text-xs font-bold uppercase tracking-[0.3em] text-accent mb-5">
                  {t.businessTourEyebrow}
                </span>
                <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-4 text-balance">
                  {t.businessTourTitle}
                </h2>
                <p className="text-lg sm:text-xl font-medium text-accent/90 mb-6 leading-snug italic">
                  &ldquo;{t.businessTourTagline}&rdquo;
                </p>
                <p className="text-white/70 leading-relaxed mb-8 max-w-lg">
                  {t.businessTourBody}
                </p>
              </RevealOnScroll>
              <RevealOnScroll delayMs={80}>
                <ul className="space-y-3 mb-10">
                  {t.businessTourItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-black text-xs font-bold">▶</span>
                      <span className="text-white/80 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </RevealOnScroll>
            </div>

            {/* Right: large inline video player (7 cols) */}
            <RevealOnScroll delayMs={60} className="lg:col-span-7 w-full">
              <BusinessTourVideoPlayer videoId="VZ6tcyH1RDY" locale={locale} title={t.businessTourTitle} />

              {/* Description + emoji highlights below the video */}
              <div className="mt-8 sm:mt-10">
                <p className="text-white/75 text-base sm:text-lg leading-relaxed text-center max-w-2xl mx-auto mb-6">
                  {locale === 'fr'
                    ? '🎬 Une immersion authentique au cœur des entreprises, marques et fondateurs qui construisent en silence — avant que le monde ne les remarque.'
                    : locale === 'de'
                    ? '🎬 Ein authentischer Einblick in Unternehmen, Marken und Gründer:innen, die im Stillen aufbauen – bevor die Welt sie bemerkt.'
                    : '🎬 An authentic look inside the businesses, brands and founders who build quietly — long before the world notices.'}
                </p>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
                  {[
                    {
                      icon: '🏭',
                      label:
                        locale === 'fr' ? 'Entreprises' : locale === 'de' ? 'Betriebe' : 'Businesses',
                    },
                    { icon: '🎥', label: 'Mini-docs' },
                    { icon: '🌍', label: 'Diaspora' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm py-4 px-2 text-center transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.07] hover:-translate-y-0.5"
                    >
                      <div className="text-2xl sm:text-3xl mb-1">{item.icon}</div>
                      <div className="text-xs sm:text-sm text-white/70 font-semibold tracking-wide">
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          </div>
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
      <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
        {/* subtle grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        {/* soft ambient backdrop */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(140,26,26,0.05),transparent_55%),radial-gradient(circle_at_85%_80%,rgba(245,184,46,0.06),transparent_55%)]" />
        {/* floating orbs */}
        <div aria-hidden className="pointer-events-none absolute top-1/4 -left-24 h-72 w-72 rounded-full bg-primary/[0.04] blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-1/4 -right-24 h-80 w-80 rounded-full bg-accent/[0.05] blur-3xl" />
        {/* top & bottom hairline gradients */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
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
                <div className="group relative flex flex-col h-full rounded-2xl border border-gray-100/70 bg-white p-7 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_48px_-12px_rgba(140,26,26,0.18)] hover:-translate-y-1.5 hover:border-primary/20 transition-all duration-500 overflow-hidden">
                  {/* gradient accent bar (top) */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {/* corner glow */}
                  <span className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br from-accent/20 to-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  {/* watermark index */}
                  <span className="pointer-events-none absolute top-4 right-5 font-display text-5xl font-bold leading-none text-gray-100 group-hover:text-primary/10 transition-colors duration-500 select-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* accent line */}
                  <span className="block h-[2px] w-8 rounded-full bg-gradient-to-r from-primary to-accent group-hover:w-14 transition-all duration-500" />
                  <h3 className="mt-4 text-lg font-semibold text-brand-dark group-hover:text-primary transition-colors duration-300">
                    {prog.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">{prog.desc}</p>
                </div>
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
      <section className="relative py-24 sm:py-36 overflow-hidden bg-[#0f0a0a]">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <RevealOnScroll>
            <div className="text-center mb-16 sm:mb-20">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.35em] text-accent mb-5">
                {t.impactEyebrow}
              </span>
              <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-tight mb-5 text-balance">
                {t.impactTitle}
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
                {t.impactLead}
              </p>
            </div>
          </RevealOnScroll>

          {/* Value cards — horizontal numbered list */}
          <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-white/[0.06]">
            {t.values.map((v, i) => (
              <RevealOnScroll key={v.title} delayMs={i * 60}>
                <div className="group relative bg-white/[0.03] hover:bg-white/[0.07] transition-all duration-500 p-8 sm:p-10 flex flex-col gap-4 h-full border border-white/[0.05]">
                  {/* Number */}
                  <span className="font-display text-6xl font-bold leading-none text-white/[0.06] group-hover:text-accent/20 transition-colors duration-500 select-none absolute top-6 right-8">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {/* Accent line */}
                  <span className="block h-[2px] w-10 rounded-full bg-gradient-to-r from-accent to-primary group-hover:w-16 transition-all duration-500" />
                  <h3 className="font-display text-xl sm:text-2xl font-semibold text-white leading-snug">
                    {v.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed group-hover:text-white/75 transition-colors duration-300">
                    {v.desc}
                  </p>
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
            <PhotoStrip photos={photos} />
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
