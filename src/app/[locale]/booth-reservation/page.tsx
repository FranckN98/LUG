import React from 'react';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';
import BoothReservationClient from './BoothReservationClient';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/booth-reservation');
}

export default async function BoothReservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  return <BoothReservationClient initialLocale={loc} />;
}
