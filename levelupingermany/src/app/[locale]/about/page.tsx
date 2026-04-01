import React from 'react';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/about');
}

const content: Record<
  Locale,
  { title: string; intro: string; mission: string; missionText: string }
> = {
  de: {
    title: 'Über uns',
    intro: 'Level Up in Germany unterstützt Menschen dabei, in Deutschland beruflich und persönlich anzukommen.',
    mission: 'Unsere Mission',
    missionText:
      'Wir schaffen Räume für Vernetzung, Lernen und gegenseitige Unterstützung – durch Workshops, Mentoring und unsere jährliche Konferenz.',
  },
  en: {
    title: 'About Us',
    intro: 'Level Up in Germany helps people settle professionally and personally in Germany.',
    mission: 'Our Mission',
    missionText:
      'We create spaces for networking, learning and mutual support – through workshops, mentoring and our annual conference.',
  },
  fr: {
    title: 'À propos',
    intro: 'Level Up in Germany aide les personnes à s\'installer professionnellement et personnellement en Allemagne.',
    mission: 'Notre mission',
    missionText:
      'Nous créons des espaces de réseau, d\'apprentissage et d\'entraide – ateliers, mentorat et notre conférence annuelle.',
  },
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
        {t.title}
      </h1>
      <p className="text-lg text-gray-600 mb-8">{t.intro}</p>
      <h2 className="text-xl font-semibold text-primary mb-3">{t.mission}</h2>
      <p className="text-gray-700">{t.missionText}</p>
    </div>
  );
}
