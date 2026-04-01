'use client';

import { useEffect } from 'react';
import type { Locale } from '@/i18n/config';

const HTML_LANG: Record<Locale, string> = {
  de: 'de',
  en: 'en',
  fr: 'fr',
};

/**
 * Aligne l\u2019attribut \u003chtml lang\u003e sur la locale de l\u2019URL (SEO + accessibilit\u00e9).
 */
export function DocumentLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = HTML_LANG[locale] ?? 'en';
  }, [locale]);
  return null;
}
