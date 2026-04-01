import React from 'react';
import type { Locale } from '@/i18n/config';
import { EventsLanding } from '@/components/EventsLanding';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/events/levelup2025');
}

export default async function EventsLevelUp2025Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;

  return <EventsLanding locale={loc} focusEdition="2025" />;
}
