import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/buy-ticket');
}

const content: Record<Locale, { title: string; intro: string; cta: string }> = {
  de: {
    title: 'Tickets',
    intro: 'Tickets für unsere Veranstaltungen und die jährliche Konferenz erhalten Sie über unseren Ticketing-Partner.',
    cta: 'Zum Ticket-Verkauf',
  },
  en: {
    title: 'Buy Ticket',
    intro: 'Get tickets for our events and the annual conference via our ticketing partner.',
    cta: 'Go to ticket sale',
  },
  fr: {
    title: 'Billetterie',
    intro: 'Obtenez vos billets pour nos événements et la conférence annuelle via notre partenaire.',
    cta: 'Accéder à la billetterie',
  },
};

export default async function BuyTicketPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
        {t.title}
      </h1>
      <p className="text-gray-600 mb-8">{t.intro}</p>
      <Link
        href="#"
        className="inline-block px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark transition"
      >
        {t.cta}
      </Link>
      <p className="mt-4 text-sm text-gray-500">
        [Link zum Ticketing-Partner einfügen]
      </p>
    </div>
  );
}
