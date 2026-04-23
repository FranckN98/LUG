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

  let heroImages: string[] = [];
  const communityPhotos = getPublicCommunityGallery();
  try {
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
  } catch {
    // DB not available — HeroCarousel will use its built-in fallback
  }

  return (
    <>
      <HeroCarousel
        images={heroImages}
        tagline={t.heroTagline}
        title={t.heroTitle}
        subtitle={t.heroSubtitle}
        stats={t.stats}
        primaryButton={{ label: t.heroBtnJoin, href: `${base}/contact` }}
        buttons={[
          { label: t.heroBtnAttend, href: `${base}/events` },
          { label: t.heroBtnPartner, href: `${base}/contact` },
        ]}
        autoplayInterval={6000}
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
