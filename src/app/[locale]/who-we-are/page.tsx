import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { CORE_TEAM_MEMBERS } from '@/content/core-team';
import { whoWeAreContent } from '@/content/who-we-are';
import { CoreTeamGrid } from '@/components/CoreTeamGrid';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { generateMetadataForPath } from '@/lib/seo';
import { prisma } from '@/lib/prisma';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/who-we-are');
}

export default async function WhoWeArePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = whoWeAreContent[loc];

  // Fetch DB bios and merge with static data
  let dbRows: {
    name: string;
    roleDe: string | null;
    roleEn: string | null;
    roleFr: string | null;
    bioDe: string | null;
    bioEn: string | null;
    bioFr: string | null;
    linkedin: string | null;
    imageUrl: string | null;
  }[] = [];
  try {
    dbRows = await prisma.teamMember.findMany();
  } catch {
    // DB not yet migrated — use static data only
  }

  const members = CORE_TEAM_MEMBERS.map((m) => {
    const db = dbRows.find((r) => r.name === m.name);
    if (!db) return m;
    return {
      ...m,
      role: {
        de: db.roleDe || m.role.de,
        en: db.roleEn || m.role.en,
        fr: db.roleFr || m.role.fr,
      },
      image: db.imageUrl || m.image,
      bio: { de: db.bioDe ?? '', en: db.bioEn ?? '', fr: db.bioFr ?? '' },
      linkedin: db.linkedin || undefined,
    };
  });

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[52vh] sm:min-h-[60vh] flex items-end overflow-hidden">
        {/* Dark-red background with ambient glows */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_30%,rgba(233,140,11,0.22),transparent_50%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_80%,rgba(140,26,26,0.5),transparent_45%)]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        {/* Large decorative number */}
        <span
          className="pointer-events-none select-none absolute right-6 top-1/2 -translate-y-1/2 text-[12rem] sm:text-[18rem] font-black leading-none text-white/[0.03]"
          aria-hidden
        >
          08
        </span>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 pt-20 sm:pt-24 w-full">
          <RevealOnScroll>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-accent mb-4">
              {t.team.heading}
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white text-balance leading-[1.02] max-w-3xl font-display">
              {t.title}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-white/65 max-w-xl leading-relaxed font-sans">
              {t.team.lead}
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── TEAM GRID ── */}
      <section className="relative py-14 sm:py-20 overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #1a0a0a 0%, #2a1010 35%, #1a1a2e 70%, #0f0f1a 100%)',
        }}
      >
        {/* Ambient glows for depth */}
        <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-72 bg-accent/8 blur-[80px] rounded-full" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-80 h-60 bg-primary/15 blur-[70px] rounded-full" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-48 bg-accent/4 blur-[100px] rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <CoreTeamGrid members={members} locale={loc} />
          </RevealOnScroll>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="relative py-24 sm:py-32 overflow-hidden">
        {/* Background: dark warm */}
        <div className="absolute inset-0 bg-[#0d0806]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(233,140,11,0.12),transparent)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_60%_50%_at_0%_50%,rgba(140,26,26,0.3),transparent)]" />

        {/* Giant decorative word */}
        <span
          className="pointer-events-none select-none absolute -bottom-8 right-0 text-[10rem] sm:text-[16rem] font-black leading-none text-white/[0.025] tracking-tighter"
          aria-hidden
        >
          STORY
        </span>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">

          {/* Eyebrow */}
          <RevealOnScroll>
            <div className="flex items-center gap-4 mb-14">
              <div className="h-px w-10 bg-accent" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">
                {t.story.heading}
              </p>
            </div>
          </RevealOnScroll>

          {/* Central quote — full width, massive */}
          <RevealOnScroll delayMs={60}>
            <blockquote className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold text-white leading-[1.2] text-balance mb-10 max-w-3xl">
              <span className="text-accent">&ldquo;</span>
              {t.story.highlight}
              <span className="text-accent">&rdquo;</span>
            </blockquote>
            <div className="h-[2px] w-20 bg-gradient-to-r from-accent to-primary mb-14" />
          </RevealOnScroll>

          {/* Two-column body text */}
          <div className="grid sm:grid-cols-2 gap-8 sm:gap-16">
            <RevealOnScroll delayMs={100}>
              <div className="space-y-5">
                {t.story.lines.map((line, i) => (
                  <p key={i} className="text-base sm:text-lg text-white/70 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
            </RevealOnScroll>

            <RevealOnScroll delayMs={160}>
              <div className="space-y-5">
                {t.story.afterHighlight.map((line, i) => (
                  <p
                    key={i}
                    className={`leading-relaxed ${
                      i === t.story.afterHighlight.length - 1
                        ? 'text-base sm:text-lg font-semibold text-accent'
                        : 'text-base sm:text-lg text-white/70'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── VISION — full-bleed dark ── */}
      <section className="relative py-20 sm:py-28 overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_30%,rgba(233,140,11,0.2),transparent_50%)]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_80%,rgba(140,26,26,0.4),transparent_45%)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent mb-6">
              {t.vision.heading}
            </p>
          </RevealOnScroll>

          <RevealOnScroll delayMs={80}>
            <div className="max-w-3xl">
              <p className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold text-white leading-snug text-balance">
                {locale === 'de' && (
                  <>
                    Wir bauen die Brücke zwischen denen, die{' '}
                    <span className="text-accent">schon weiter sind</span>, und denen,
                    die gerade ankommen. Damit Erfahrung weitergeht,
                    Fehler kleiner werden und{' '}
                    <span className="text-accent">Chancen erreichbar</span> bleiben.
                  </>
                )}
                {locale === 'en' && (
                  <>
                    We build the bridge between people who{' '}
                    <span className="text-accent">are already further along</span> and
                    people who are just arriving. So that experience gets passed on,
                    mistakes get smaller, and{' '}
                    <span className="text-accent">opportunities stay within reach</span>.
                  </>
                )}
                {locale === 'fr' && (
                  <>
                    Nous faisons le pont entre ceux qui{' '}
                    <span className="text-accent">ont déjà avancé</span> et ceux qui
                    arrivent. Pour que l&apos;expérience se partage, que les erreurs
                    coûtent moins cher et que les{' '}
                    <span className="text-accent">opportunités restent accessibles</span>.
                  </>
                )}
              </p>
              <div className="mt-8 h-px bg-gradient-to-r from-accent/60 via-primary/40 to-transparent" />
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-white via-orange-50/40 to-white overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <RevealOnScroll>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent mb-4">
              {loc === 'de' ? 'Kontakt' : loc === 'fr' ? 'Contact' : 'Get in touch'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-6 text-balance">
              {loc === 'de'
                ? 'Treten Sie mit uns in Kontakt'
                : loc === 'fr'
                ? 'Entrez en contact avec nous'
                : 'Reach out to us'}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href={`/${loc}/contact`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-light hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t.ctaContact} →
              </Link>
              <Link
                href={`/${loc}/membership`}
                className="group inline-flex items-center justify-center gap-2 rounded-full border-2 border-accent bg-white px-8 py-3.5 text-sm font-semibold text-accent-dark shadow-sm hover:bg-accent hover:text-black hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98] transition-all duration-300"
              >
                <span aria-hidden className="text-base leading-none">★</span>
                {loc === 'de'
                  ? 'Mitglied werden'
                  : loc === 'fr'
                  ? 'Devenir membre'
                  : 'Become a member'}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

    </div>
  );
}
