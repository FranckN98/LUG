import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { generateMetadataForPath } from '@/lib/seo';
import { partners2025 } from '@/content/partners';
import { prisma } from '@/lib/prisma';

type PartnerRow = { id: string; name: string; logoUrl: string; websiteUrl: string | null; sortOrder: number };

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/partners');
}

const content: Record<Locale, {
  eyebrow: string; title: string; intro: string;
  sectionCurrent: string; sectionBecome: string;
  becomeTitle: string; becomeBody: string; cta: string;
  perks: { title: string; body: string }[];
}> = {
  de: {
    eyebrow: 'Unser Netzwerk',
    title: 'Partner & Sponsoren',
    intro: 'Organisationen, Unternehmen und Institutionen, die an eine vernetzte Diaspora glauben — und unsere Mission aktiv unterstützen.',
    sectionCurrent: 'Sie vertrauen uns',
    sectionBecome: 'Partner werden',
    becomeTitle: 'Gemeinsam weiter kommen.',
    becomeBody: 'Als Partner von Level Up in Germany erreichen Sie eine hochqualifizierte, engagierte Community. Sie stärken Ihre Sichtbarkeit, zeigen gesellschaftliche Verantwortung und öffnen Türen für echte Verbindungen.',
    cta: 'Sponsoring-Anfrage stellen',
    perks: [
      { title: 'Sichtbarkeit', body: 'Präsenz auf Events, Website und Social Media vor einer aktiven Diaspora-Community.' },
      { title: 'Netzwerk', body: 'Direkter Zugang zu Fachkräften, Unternehmern und Talenten aus der Diaspora.' },
      { title: 'Impact', body: 'Ihr Engagement fördert Integration, Aufstieg und gesellschaftlichen Zusammenhalt.' },
    ],
  },
  en: {
    eyebrow: 'Our Network',
    title: 'Partners & Sponsors',
    intro: 'Organizations, companies, and institutions that believe in a connected diaspora — and actively support our mission.',
    sectionCurrent: 'They trust us',
    sectionBecome: 'Become a partner',
    becomeTitle: 'Go further, together.',
    becomeBody: 'As a Level Up in Germany partner, you reach a highly qualified, engaged community. You strengthen your visibility, demonstrate social responsibility, and open doors to real connections.',
    cta: 'Send a sponsorship request',
    perks: [
      { title: 'Visibility', body: 'Presence at events, on our website and social media in front of an active diaspora community.' },
      { title: 'Network', body: 'Direct access to professionals, entrepreneurs and talents from the diaspora.' },
      { title: 'Impact', body: 'Your commitment promotes integration, advancement and social cohesion.' },
    ],
  },
  fr: {
    eyebrow: 'Notre réseau',
    title: 'Partenaires & Sponsors',
    intro: 'Organisations, entreprises et institutions qui croient en une diaspora connectée — et soutiennent activement notre mission.',
    sectionCurrent: 'Ils nous font confiance',
    sectionBecome: 'Devenir partenaire',
    becomeTitle: 'Avancer ensemble.',
    becomeBody: 'En tant que partenaire de Level Up in Germany, vous atteignez une communauté hautement qualifiée et engagée. Vous renforcez votre visibilité, démontrez votre responsabilité sociale et ouvrez des portes à de vraies connexions.',
    cta: 'Envoyer une demande de sponsoring',
    perks: [
      { title: 'Visibilité', body: 'Présence lors des événements, sur le site et les réseaux sociaux auprès d\'une communauté diaspora active.' },
      { title: 'Réseau', body: 'Accès direct à des professionnels, entrepreneurs et talents de la diaspora.' },
      { title: 'Impact', body: 'Votre engagement favorise l\'intégration, l\'ascension sociale et la cohésion.' },
    ],
  },
};



export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const t = content[loc];

  // Load partners from DB; fall back to static data if none yet
  let dbPartners: PartnerRow[] = [];
  try {
    dbPartners = await prisma.partner.findMany({
      where: { visible: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, logoUrl: true, websiteUrl: true, sortOrder: true },
    });
  } catch { /* DB unavailable — fall back to static */ }

  const useStatic = dbPartners.length === 0;
  const staticPartners = partners2025.map((p, i) => ({
    id: p.name,
    name: p.name,
    logoUrl: p.logo,
    websiteUrl: p.website ?? null,
    sortOrder: i,
  }));
  const displayPartners: PartnerRow[] = useStatic ? staticPartners : dbPartners;

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_30%,rgba(233,140,11,0.22),transparent_50%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_80%,rgba(140,26,26,0.5),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)`, backgroundSize: '64px 64px' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20 pt-24 sm:pt-28 w-full">
          <RevealOnScroll>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-accent mb-4">{t.eyebrow}</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-display leading-[1.02] max-w-3xl">{t.title}</h1>
            <p className="mt-5 text-base sm:text-lg text-white/65 max-w-xl leading-relaxed">{t.intro}</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── CURRENT PARTNERS ── */}
      <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
        <div className="absolute left-0 top-16 bottom-16 w-1 bg-gradient-to-b from-transparent via-accent to-transparent rounded-full" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <div className="flex items-center gap-4 mb-12">
              <div className="h-px w-10 bg-accent" />
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{t.sectionCurrent}</p>
            </div>
          </RevealOnScroll>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {displayPartners.map((partner, i) => (
              <RevealOnScroll key={partner.id} delayMs={i * 40}>
                {partner.websiteUrl ? (
                  <a
                    href={partner.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={partner.name}
                    className={`group h-20 sm:h-24 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-center px-4 transition-all duration-300 hover:border-accent/40 hover:shadow-md card-hover-lift overflow-hidden ${i === 0 ? 'border-2 border-accent/60' : ''}`}
                  >
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={180}
                      height={90}
                      className="max-h-24 w-auto object-contain"
                      priority={i < 3}
                    />
                  </a>
                ) : (
                  <div
                    className={`group h-20 sm:h-24 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-center px-4 transition-all duration-300 hover:border-accent/40 hover:shadow-md card-hover-lift overflow-hidden ${i === 0 ? 'border-2 border-accent/60' : ''}`}
                  >
                    <Image
                      src={partner.logoUrl}
                      alt={partner.name}
                      width={180}
                      height={90}
                      className="max-h-24 w-auto object-contain"
                      priority={i < 3}
                    />
                  </div>
                )}
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── BECOME A PARTNER ── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#0d0806]" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_70%_60%_at_80%_50%,rgba(233,140,11,0.15),transparent)]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_50%_60%_at_10%_50%,rgba(140,26,26,0.35),transparent)]" />
        <span className="pointer-events-none select-none absolute -bottom-8 right-0 text-[10rem] sm:text-[16rem] font-black leading-none text-white/[0.025] tracking-tighter" aria-hidden>PARTNER</span>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-14 md:gap-20 items-center">
            <RevealOnScroll>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-10 bg-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{t.sectionBecome}</p>
              </div>
              <h2 className="text-4xl sm:text-5xl font-display font-semibold text-white leading-snug text-balance mb-6">{t.becomeTitle}</h2>
              <p className="text-base sm:text-lg text-white/65 leading-relaxed mb-8">{t.becomeBody}</p>
              <Link
                href={`/${loc}/contact`}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-brand-dark shadow-lg hover:bg-accent-light hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
              >
                {t.cta} →
              </Link>
            </RevealOnScroll>

            <RevealOnScroll delayMs={100}>
              <div className="space-y-4">
                {t.perks.map((perk, i) => (
                  <div key={i} className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 sm:p-6 transition-all duration-300 hover:bg-white/8 hover:border-accent/30">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-sm font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{perk.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{perk.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

    </div>
  );
}
