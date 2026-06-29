import React from 'react';
import { CookieBanner } from '@/components/CookieBanner';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { ScrollToHash } from '@/components/ScrollToHash';
import { DocumentLang } from '@/components/DocumentLang';
import { locales, type Locale } from '@/i18n/config';

export default async function NoShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';

  return (
    <>
      <DocumentLang locale={validLocale} />
      <ScrollToHash />
      <main className="w-full">{children}</main>
      <CookieBanner locale={validLocale} />
      <AnalyticsProvider />
    </>
  );
}
