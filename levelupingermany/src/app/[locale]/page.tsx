import React from 'react';
import { HeroSlider } from '@/components/HeroSlider';
import { HomePageSections } from '@/components/HomePageSections';
import type { Locale } from '@/i18n/config';
import { HERO_SLIDER_SLIDES } from '@/data/gallery';
import { homeContent } from '@/content/home';
import { getWhatsAppJoinUrl } from '@/config/whatsapp';
import { generateMetadataForPath } from '@/lib/seo';

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

  return (
    <>
      <HeroSlider
        slides={HERO_SLIDER_SLIDES}
        tagline={t.heroTagline}
        title={t.heroTitle}
        subtitle={t.heroSubtitle}
        primaryButton={{ label: t.heroBtnJoin, href: joinWhatsAppUrl }}
        buttons={[
          { label: t.heroBtnAttend, href: `${base}/events` },
          { label: t.heroBtnPartner, href: `${base}/sponsor-donate` },
        ]}
        autoPlayMs={6000}
      />
      <HomePageSections t={t} base={base} joinWhatsAppUrl={joinWhatsAppUrl} locale={loc} />
    </>
  );
}
