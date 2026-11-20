import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { generateMetadataForPath } from '@/lib/seo';
import { partners2025 } from '@/content/partners';
import { prisma } from '@/lib/prisma';

type PartnerRow = { id: string; name: string; logoUrl: string; logoZoom: number; websiteUrl: string | null; category: string; sortOrder: number };

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/partners');
}

const content: Record<Locale, {
  eyebrow: string; title: string; intro: string;
  sectionCurrent: string; sectionBecome: string;
  sponsorsTitle: string; partnersTitle: string; noSponsors: string; noPartners: string;
  becomeTitle: string; becomeBody: string; cta: string;
  perks: { title: string; body: string }[];
}> = {
  de: {
    eyebrow: 'Unser Netzwerk',
    title: 'Partner & Sponsoren',
    intro: 'Organisationen, Unternehmen und Institutionen, die an die Stärke der Diaspora glauben und Career, Business und Network mit uns wachsen lassen.',
    sectionCurrent: 'Sie vertrauen uns',
    sectionBecome: 'Partner werden',
    sponsorsTitle: 'Sponsoren',
    partnersTitle: 'Partner',
    noSponsors: 'Noch keine Sponsoren gelistet.',
    noPartners: 'Noch keine Partner gelistet.',
    becomeTitle: 'Ihre Marke im Kontakt mit Ambition.',
    becomeBody: 'Als Partner von Level Up in Germany treffen Sie Talente und Unternehmer:innen der afrikanischen Diaspora. Teilen Sie Ihre Expertise, zeigen Sie Ihre Perspektiven und unterstützen Sie Begegnungen, die Karrieren und Projekte voranbringen.',
    cta: 'Sponsoring-Anfrage stellen',
    perks: [
      { title: 'Sichtbarkeit', body: 'Zeigen Sie Ihre Expertise und Ihre beruflichen Perspektiven in unseren Formaten und Kanälen.' },
      { title: 'Netzwerk', body: 'Treffen Sie Fachkräfte, Gründer:innen und Talente der afrikanischen Diaspora in Deutschland.' },
      { title: 'Wirkung', body: 'Ihr Engagement schafft Begegnungen, die Karriere, Business und Netzwerk stärken.' },
    ],
  },
  en: {
    eyebrow: 'Our Network',
    title: 'Partners & Sponsors',
    intro: 'Organisations, companies and institutions that believe in the strength of the diaspora and help Career, Business and Network grow with us.',
    sectionCurrent: 'They trust us',
    sectionBecome: 'Become a partner',
    sponsorsTitle: 'Sponsors',
    partnersTitle: 'Partners',
    noSponsors: 'No sponsors listed yet.',
    noPartners: 'No partners listed yet.',
    becomeTitle: 'Your brand in contact with ambition.',
    becomeBody: 'As a Level Up in Germany partner, you meet African diaspora talent and entrepreneurs. Share your expertise, show your perspective and support encounters that move careers and projects forward.',
    cta: 'Send a sponsorship request',
    perks: [
      { title: 'Visibility', body: 'Share your expertise and professional perspectives through our formats and channels.' },
      { title: 'Network', body: 'Meet professionals, founders and African diaspora talent building their future in Germany.' },
      { title: 'Impact', body: 'Your support creates encounters that strengthen careers, business and network.' },
    ],
  },
  fr: {
    eyebrow: 'Notre réseau',
    title: 'Partenaires & Sponsors',
    intro: 'Des organisations, des entreprises et des institutions qui croient à la force de la diaspora et font grandir avec nous Career, Business et Network.',
    sectionCurrent: 'Ils nous font confiance',
    sectionBecome: 'Devenir partenaire',
    sponsorsTitle: 'Sponsors',
    partnersTitle: 'Partenaires',
    noSponsors: 'Aucun sponsor pour le moment.',
    noPartners: 'Aucun partenaire pour le moment.',
    becomeTitle: 'Votre marque au contact de l’ambition.',
    becomeBody: 'En devenant partenaire de Level Up in Germany, vous rencontrez les talents et entrepreneurs de la diaspora africaine. Partagez votre expertise et soutenez des rencontres qui font avancer les carrières et les projets.',
    cta: 'Envoyer une demande de sponsoring',
    perks: [
      { title: 'Visibilité', body: 'Partagez votre expertise et vos perspectives professionnelles dans nos formats et nos canaux.' },
      { title: 'Réseau', body: 'Rencontrez des professionnels, entrepreneurs et talents de la diaspora africaine en Allemagne.' },
      { title: 'Impact', body: 'Votre soutien crée des rencontres utiles pour la carrière, le business et le réseau.' },
    ],
  },
};



function PartnerLogo({ partner, priority }: { partner: PartnerRow; priority: boolean }) {
  const img = (
    <Image
      src={partner.logoUrl}
      alt={partner.name}
      width={180}
      height={90}
      className="max-h-24 w-auto object-contain"
      style={{ transform: `scale(${partner.logoZoom ?? 1})` }}
      priority={priority}
    />
  );
  const cardClass = 'group h-20 sm:h-24 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center justify-center px-4 transition-all duration-300 hover:border-accent/40 hover:shadow-md card-hover-lift overflow-hidden';

  return (
    <RevealOnScroll>
      {partner.websiteUrl ? (
        <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label={partner.name} className={cardClass}>
          {img}
        </a>
      ) : (
        <div className={cardClass}>{img}</div>
      )}
    </RevealOnScroll>
  );
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const t = content[loc];

  // Load partners from DB; fall back to static data only if the table has never been seeded
  let dbPartners: (PartnerRow & { visible: boolean })[] = [];
  try {
    dbPartners = await prisma.partner.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { id: true, name: true, logoUrl: true, logoZoom: true, websiteUrl: true, category: true, sortOrder: true, visible: true },
    });
  } catch { /* DB unavailable — fall back to static */ }

  const STATIC_ZOOM_OVERRIDES: Record<string, number> = { Regus: 0.6, 'African Power': 2 };
  const staticPartners = partners2025.map((p, i) => ({
    id: p.name,
    name: p.name,
    logoUrl: p.logo,
    logoZoom: STATIC_ZOOM_OVERRIDES[p.name] ?? 1,
    websiteUrl: p.website ?? null,
    category: 'partner',
    sortOrder: i,
  }));

  const normalizedDb = dbPartners.map((p) => ({
    ...p,
    name: p.name.trim(),
    logoUrl: p.logoUrl.trim(),
    websiteUrl: p.websiteUrl?.trim() || null,
  }));

  const staticByName = new Map(staticPartners.map((p) => [p.name.toLowerCase(), p]));
  const dbByName = new Map(normalizedDb.map((p) => [p.name.toLowerCase(), p]));
  const hasDbData = normalizedDb.length > 0;

  const displayPartners: PartnerRow[] = [
    ...staticPartners
      .map((staticPartner) => {
        const dbMatch = dbByName.get(staticPartner.name.toLowerCase());
        if (dbMatch) {
          // The DB row is authoritative once it exists — respect admin edits, hiding and deletion.
          if (!dbMatch.visible) return null;
          return { ...dbMatch, id: dbMatch.id, name: staticPartner.name, logoUrl: dbMatch.logoUrl || staticPartner.logoUrl, logoZoom: dbMatch.logoZoom ?? staticPartner.logoZoom, websiteUrl: dbMatch.websiteUrl || staticPartner.websiteUrl, category: dbMatch.category || staticPartner.category, sortOrder: staticPartner.sortOrder };
        }
        // No DB row for this partner: only fall back to the static default when the table
        // has never been seeded at all; otherwise it means an admin deleted it on purpose.
        return hasDbData ? null : { ...staticPartner };
      })
      .filter((p): p is PartnerRow => p !== null),
    ...normalizedDb.filter((dbPartner) => dbPartner.visible && !staticByName.has(dbPartner.name.toLowerCase())),
  ];

  const sponsorPartners = displayPartners.filter((p) => p.category.includes('sponsor'));
  const regularPartners = displayPartners.filter((p) => !p.category.includes('sponsor'));

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

          <div className="grid gap-14 lg:grid-cols-2 lg:gap-10 xl:gap-16">
            <div>
              <h2 className="mb-6 text-lg font-bold uppercase tracking-wide text-brand-dark sm:text-xl">{t.sponsorsTitle}</h2>
              {sponsorPartners.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {sponsorPartners.map((partner, i) => (
                    <PartnerLogo key={partner.id} partner={partner} priority={i < 3} />
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">{t.noSponsors}</p>
              )}
            </div>

            <div className="lg:border-l lg:border-gray-100 lg:pl-10 xl:pl-16">
              <h2 className="mb-6 text-lg font-bold uppercase tracking-wide text-brand-dark sm:text-xl">{t.partnersTitle}</h2>
              {regularPartners.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                  {regularPartners.map((partner, i) => (
                    <PartnerLogo key={partner.id} partner={partner} priority={i < 3} />
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">{t.noPartners}</p>
              )}
            </div>
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
