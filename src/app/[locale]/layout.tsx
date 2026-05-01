import React from 'react';
import type { Metadata } from 'next';
import { locales, type Locale } from '@/i18n/config';
import { getWhatsAppJoinUrl } from '@/config/whatsapp';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import { AnalyticsProvider } from '@/components/AnalyticsProvider';
import { EventCommunicationPopupGate } from '@/components/EventCommunicationPopupGate';
import { ScrollToHash } from '@/components/ScrollToHash';
import { JsonLdSite } from '@/components/JsonLdSite';
import { DocumentLang } from '@/components/DocumentLang';
import { buildLocaleLayoutMetadata } from '@/lib/seo';
import { prisma } from '@/lib/prisma';

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
  let siteConfig: {
    headerLogoUrl?: string | null;
    headerJoinLabelFr?: string | null;
    headerJoinLabelDe?: string | null;
    headerJoinLabelEn?: string | null;
    headerJoinLink?: string | null;
    headerJoinOpenInNewTab?: boolean;
    headerSponsorLabelFr?: string | null;
    headerSponsorLabelDe?: string | null;
    headerSponsorLabelEn?: string | null;
    headerSponsorLink?: string | null;
    headerSponsorOpenInNewTab?: boolean;
  } | null = null;

  try {
    siteConfig = await prisma.siteConfig.findUnique({ where: { id: 'singleton' } });
  } catch {
    siteConfig = null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <DocumentLang locale={validLocale} />
      <JsonLdSite locale={validLocale} />
      <ScrollToHash />
      <Header locale={validLocale} joinWhatsAppUrl={joinWhatsAppUrl} siteConfig={siteConfig} />
      <main className="flex-1 w-full pt-16 sm:pt-20 md:pt-[5.5rem]">{children}</main>
      <Footer locale={validLocale} joinWhatsAppUrl={joinWhatsAppUrl} />
      <EventCommunicationPopupGate locale={validLocale} />
      <CookieBanner locale={validLocale} />
      <AnalyticsProvider />
    </div>
  );
}
