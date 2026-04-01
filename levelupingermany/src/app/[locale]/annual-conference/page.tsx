import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/annual-conference');
}

const content: Record<Locale, { title: string; intro: string; cta: string }> = {
  de: { title: 'Jaehrliche Konferenz', intro: 'Alle Informationen zur naechsten Konferenz: Programm, Speakers, Tickets und FAQ.', cta: 'Zur Konferenzseite' },
  en: { title: 'Annual Conference', intro: 'All information about the next conference: schedule, speakers, tickets and FAQ.', cta: 'Open conference page' },
  fr: { title: 'Conference annuelle', intro: 'Toutes les informations sur la prochaine conference: programme, speakers, billets et FAQ.', cta: 'Voir la page conference' },
};

export default async function AnnualConferenceHubPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t.title}</h1>
      <p className="text-gray-600 mb-8">{t.intro}</p>
      <Link href={`/${loc}/programme/conference`} className="inline-block px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary-light transition">{t.cta}</Link>
    </div>
  );
}
