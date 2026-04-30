import React from 'react';
import type { Locale } from '@/i18n/config';
import { EventsLanding } from '@/components/EventsLanding';
import { generateMetadataForPath } from '@/lib/seo';

// Always render fresh — Vercel/Next.js shall not cache this route.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/events');
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;

  return <EventsLanding locale={loc} />;
}
