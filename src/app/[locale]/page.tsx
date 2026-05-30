import React from 'react';
import HeroCarousel from '@/components/HeroCarousel';
import { HomePageSections } from '@/components/HomePageSections';
import type { Locale } from '@/i18n/config';
import { homeContent } from '@/content/home';
import { getWhatsAppJoinUrl } from '@/config/whatsapp';
import { generateMetadataForPath } from '@/lib/seo';
import { prisma } from '@/lib/prisma';
import { getPublicCommunityGallery } from '@/lib/communityGallery';
import { DEFAULT_HERO_IMAGES } from '@/lib/heroDefaults';
import { pickLocalized, type CountdownLocale } from '@/lib/countdown';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '');
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const t = homeContent[loc];
  const base = `/${loc}`;
  const joinWhatsAppUrl = getWhatsAppJoinUrl(loc);
  const communityPhotos = await getPublicCommunityGallery();

  // ── Hero images ─────────────────────────────────────────────────────────────
  let heroImages: string[] = [];

  // ── DB-driven hero slides ───────────────────────────────────────────────────
  let dbHeroTitle: string | null = null;
  let dbHeroSubtitle: string | null = null;

  // ── DB-driven buttons ───────────────────────────────────────────────────────
  let dbPrimaryButton: { label: string; href: string; colorVariant?: string } | null = null;
  let dbButtons: { label: string; href: string; colorVariant?: string; openInNewTab?: boolean }[] = [];
  let hasDbButtons = false;

  try {
    // Hero slides
    const heroSlides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: [{ isMain: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    if (heroSlides.length > 0) {
      heroImages = heroSlides.map((s) => s.imageUrl);
      // Use the main (first) slide's locale-specific title/subtitle if set
      const mainSlide = heroSlides[0];
      const titleKey = `title${loc.charAt(0).toUpperCase()}${loc.slice(1)}` as 'titleFr' | 'titleDe' | 'titleEn';
      const subtitleKey = `subtitle${loc.charAt(0).toUpperCase()}${loc.slice(1)}` as 'subtitleFr' | 'subtitleDe' | 'subtitleEn';
      dbHeroTitle = (mainSlide[titleKey] ?? null) || null;
      dbHeroSubtitle = (mainSlide[subtitleKey] ?? null) || null;
    } else {
      // Fall back to media-based hero images (legacy behaviour)
      const rows = await prisma.media.findMany({
        where: { category: 'hero' },
        orderBy: { createdAt: 'asc' },
      });
      if (rows.length === 0) {
        await prisma.media.createMany({
          data: DEFAULT_HERO_IMAGES.map((url, index) => ({
            filename: `hero-default-${index + 1}`,
            url,
            altText: '',
            category: 'hero',
            size: null,
            mimeType: null,
          })),
        });
        heroImages = DEFAULT_HERO_IMAGES;
      } else {
        heroImages = rows.map((r) => r.url);
      }
    }

    // Home buttons
    const homeButtons = await prisma.homeButton.findMany({
      where: { isActive: true },
      orderBy: [{ isPrimary: 'desc' }, { displayOrder: 'asc' }],
    });

    if (homeButtons.length > 0) {
      hasDbButtons = true;
      const labelKey = `label${loc.charAt(0).toUpperCase()}${loc.slice(1)}` as 'labelFr' | 'labelDe' | 'labelEn';
      const primary = homeButtons.find((b) => b.isPrimary);
      const rest = homeButtons.filter((b) => !b.isPrimary);

      if (primary) {
        const href =
          primary.linkType === 'internal' ? `${base}${primary.linkTarget}` : primary.linkTarget;
        dbPrimaryButton = { label: primary[labelKey] || primary.labelEn, href, colorVariant: primary.colorVariant };
      }
      dbButtons = rest.map((b) => ({
        label: b[labelKey] || b.labelEn,
        href: b.linkType === 'internal' ? `${base}${b.linkTarget}` : b.linkTarget,
        colorVariant: b.colorVariant,
        openInNewTab: b.openInNewTab,
      }));
    }
  } catch {
    // DB not available — fall through to all defaults
  }

  // ── Countdown (optional, admin-controlled) ─────────────────────────────────
  let countdownProp:
    | { targetDate: string; locale: CountdownLocale; title: string | null; subtitle: string | null; endedMessage: string | null }
    | null = null;
  let countdownHidesSubtitle = false;
  try {
    const cd = await prisma.countdownConfig.findUnique({ where: { id: 'singleton' } });
    if (cd && cd.isActive && cd.targetDate) {
      const { title, subtitle, endedMessage } = pickLocalized(cd, loc as CountdownLocale);
      countdownProp = {
        targetDate: cd.targetDate.toISOString(),
        locale: loc as CountdownLocale,
        title,
        subtitle,
        endedMessage,
      };
      countdownHidesSubtitle = cd.hideHeroSubtitle;
    }
  } catch {
    // ignore — countdown is purely optional
  }

  // ── Resolved props ──────────────────────────────────────────────────────────
  const heroTitle = dbHeroTitle || t.heroTitle;
  const heroSubtitle = dbHeroSubtitle || t.heroSubtitle;
  const primaryButton = hasDbButtons && dbPrimaryButton
    ? dbPrimaryButton
    : { label: t.heroBtnJoin, href: `${base}/contact` };
  const buttons = hasDbButtons
    ? dbButtons
    : [
        { label: t.heroBtnAttend, href: `${base}/events` },
      ];

  // ── Hero eyebrow + info-line (hardcoded, trilingual) ───────────────────────
  const HERO_EYEBROW: Record<Locale, string> = {
    fr: 'PROCHAINE ÉDITION • FRANCFORT 2026',
    de: 'NÄCHSTE AUSGABE • FRANKFURT 2026',
    en: 'NEXT EDITION • FRANKFURT 2026',
  };
  const HERO_INFO_LINE: Record<Locale, string> = {
    fr: 'Francfort • Octobre 2026 • Networking • Carrière • Business • Communauté',
    de: 'Frankfurt • Oktober 2026 • Networking • Karriere • Business • Community',
    en: 'Frankfurt • October 2026 • Networking • Career • Business • Community',
  };

  return (
    <>
      <HeroCarousel
        images={heroImages}
        tagline={HERO_EYEBROW[loc]}
        title={heroTitle}
        subtitle={countdownHidesSubtitle ? undefined : heroSubtitle}
        infoLine={HERO_INFO_LINE[loc]}
        stats={t.stats}
        primaryButton={primaryButton}
        buttons={buttons}
        autoplayInterval={6000}
        countdown={countdownProp}
      />
      <HomePageSections
        t={t}
        base={base}
        joinWhatsAppUrl={joinWhatsAppUrl}
        locale={loc}
        communityPhotos={communityPhotos}
      />
    </>
  );
}

