import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/partners');
}

const content: Record<Locale, { title: string; intro: string; cta: string }> = {
  de: { title: 'Partner', intro: 'Organisationen, Unternehmen und Hochschulen, die unsere Mission unterstuetzen.', cta: 'Partner werden' },
  en: { title: 'Partners', intro: 'Organizations, companies and universities supporting our mission.', cta: 'Become a partner' },
  fr: { title: 'Partenaires', intro: 'Organisations, entreprises et universites qui soutiennent notre mission.', cta: 'Devenir partenaire' },
};

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];
  const partners = ['Partner A', 'Partner B', 'Partner C', 'Partner D', 'Partner E', 'Partner F'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t.title}</h1>
      <p className="text-gray-600 mb-8">{t.intro}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {partners.map((p) => (
          <div key={p} className="h-24 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center text-gray-500">{p}</div>
        ))}
      </div>
      <Link href={`/${loc}/sponsor-donate`} className="inline-block mt-8 px-5 py-3 rounded-lg bg-accent text-white hover:bg-accent-dark transition">{t.cta}</Link>
    </div>
  );
}
