import React from 'react';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/events/archives');
}

const content: Record<Locale, { title: string; intro: string }> = {
  de: { title: 'Event-Archive', intro: 'Vergangene Events nach Jahr mit Berichten, Fotos und Ressourcen.' },
  en: { title: 'Event Archives', intro: 'Past events by year with reports, photos and resources.' },
  fr: { title: 'Archives des evenements', intro: 'Evenements passes par annee avec rapports, photos et ressources.' },
};

export default async function EventsArchivesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t.title}</h1>
      <p className="text-gray-600 mb-6">{t.intro}</p>
      <ul className="space-y-2 text-gray-700">
        <li>- 2026 - Level Up Conference (coming soon)</li>
        <li>- 2025 - Level Up Germany Edition (report PDF placeholder)</li>
      </ul>
    </div>
  );
}
