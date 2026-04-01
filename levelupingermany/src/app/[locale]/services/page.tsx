import React from 'react';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/services');
}

const content: Record<Locale, { title: string; intro: string }> = {
  de: {
    title: 'Leistungen',
    intro: 'Wir bieten Workshops, Mentoring und Events fuer alle, die in Deutschland durchstarten moechten.',
  },
  en: {
    title: 'Services',
    intro: 'We offer workshops, mentoring and events for everyone who wants to get started in Germany.',
  },
  fr: {
    title: 'Services',
    intro: 'Nous proposons des ateliers, du mentorat et des evenements pour tous ceux qui veulent demarrer en Allemagne.',
  },
};

export default async function ServicesPage({
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
      <p className="text-lg text-gray-600">{t.intro}</p>
    </div>
  );
}
