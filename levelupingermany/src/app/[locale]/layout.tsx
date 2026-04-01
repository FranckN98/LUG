import React from 'react';
import type { Metadata } from 'next';
import { locales, type Locale } from '@/i18n/config';
import { getWhatsAppJoinUrl } from '@/config/whatsapp';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import { ScrollToHash } from '@/components/ScrollToHash';
import { JsonLdSite } from '@/components/JsonLdSite';
import { DocumentLang } from '@/components/DocumentLang';
import { buildLocaleLayoutMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';
  return buildLocaleLayoutMetadata(validLocale);
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const validLocale = locales.includes(locale as Locale) ? (locale as Locale) : 'en';
  const joinWhatsAppUrl = getWhatsAppJoinUrl(validLocale);

  return (
    <div className="min-h-screen flex flex-col">
      <DocumentLang locale={validLocale} />
      <JsonLdSite locale={validLocale} />
      <ScrollToHash />
      <Header locale={validLocale} joinWhatsAppUrl={joinWhatsAppUrl} />
      <main className="flex-1 w-full">{children}</main>
      <Footer locale={validLocale} joinWhatsAppUrl={joinWhatsAppUrl} />
      <CookieBanner locale={validLocale} />
    </div>
  );
}
