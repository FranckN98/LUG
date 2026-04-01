import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/programme/conference');
}

const content: Record<Locale, { title: string; intro: string; cta: string }> = {
  de: {
    title: 'Jährliche Konferenz',
    intro: 'Unser jährliches Event mit Speaker:innen, Workshops und Networking. Termine und Tickets unter Veranstaltungen.',
    cta: 'Tickets',
  },
  en: {
    title: 'Annual Conference',
    intro: 'Our annual event with speakers, workshops and networking. See Events for dates and tickets.',
    cta: 'Tickets',
  },
  fr: {
    title: 'Conférence annuelle',
    intro: 'Notre événement annuel avec intervenants, ateliers et networking. Voir Événements pour les dates et billets.',
    cta: 'Billetterie',
  },
};

export default async function ConferencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];
  const base = `/${loc}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
        {t.title}
      </h1>
      <p className="text-gray-600 mb-8">{t.intro}</p>
      <Link
        href={`${base}/buy-ticket`}
        className="inline-block px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark transition"
      >
        {t.cta}
      </Link>
    </div>
  );
}
