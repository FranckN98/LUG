import type { Locale } from '@/i18n/config';
import { getSiteUrl, SITE_NAME } from '@/config/site';
import { SOCIAL_LINKS } from '@/data/social';

const IN_LANG: Record<Locale, string> = {
  de: 'de-DE',
  en: 'en-US',
  fr: 'fr-FR',
};

/**
 * Donn\u00e9es structur\u00e9es schema.org (Organization + WebSite) pour le SEO.
 */
export function JsonLdSite({ locale }: { locale: Locale }) {
  const base = getSiteUrl();
  const sameAs = [SOCIAL_LINKS.linkedin, SOCIAL_LINKS.instagram, SOCIAL_LINKS.tiktok];

  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: base,
    sameAs,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'DE',
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: base,
    inLanguage: IN_LANG[locale],
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: base,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }} />
    </>
  );
}
