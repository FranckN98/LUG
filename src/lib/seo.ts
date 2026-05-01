import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { locales } from '@/i18n/config';
import { getGoogleSiteVerification, getSiteUrl, SITE_NAME } from '@/config/site';
import { getSeoForPath } from '@/content/seo-metadata';

/** Default Open Graph image used when a page does not provide one. 1200x630 PNG. */
export const DEFAULT_OG_IMAGE_PATH = '/hero/hero-1.png';

export async function generateMetadataForPath(
  params: Promise<{ locale: string }>,
  pathSuffix: string,
): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const seo = getSeoForPath(pathSuffix, loc);
  return buildPageMetadata(loc, pathSuffix, seo);
}

const OG_LOCALE: Record<Locale, string> = {
  de: 'de_DE',
  en: 'en_US',
  fr: 'fr_FR',
};

function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

/** Resolve a path or URL into an absolute URL suitable for OG/Twitter image tags. */
export function resolveOgImageUrl(image: string | null | undefined): string {
  if (!image) return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  if (/^https?:\/\//i.test(image)) return image;
  return absoluteUrl(image);
}

/**
 * M\u00e9tadonn\u00e9es par page : titre, description, URL canonique, hreflang, Open Graph, Twitter.
 */
export function buildPageMetadata(
  locale: Locale,
  pathSuffix: string,
  seo: {
    title: string;
    description: string;
    keywords?: string[];
    noindex?: boolean;
    image?: string | null;
    imageAlt?: string;
  },
): Metadata {
  const suffix = pathSuffix === '' ? '' : pathSuffix.startsWith('/') ? pathSuffix : `/${pathSuffix}`;
  const canonicalPath = `/${locale}${suffix}`;
  const url = absoluteUrl(canonicalPath);
  const imageUrl = resolveOgImageUrl(seo.image);
  const imageAlt = seo.imageAlt ?? seo.title;

  const languageAlternates: Record<string, string> = {
    'x-default': absoluteUrl(`/en${suffix}`),
  };
  for (const loc of locales) {
    languageAlternates[loc] = absoluteUrl(`/${loc}${suffix}`);
  }

  const metadata: Metadata = {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: url,
      languages: languageAlternates,
    },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title: seo.title,
      description: seo.description,
      locale: OG_LOCALE[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [imageUrl],
    },
    robots: seo.noindex
      ? { index: false, follow: true, googleBot: { index: false, follow: true } }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  };

  return metadata;
}

/** M\u00e9tadonn\u00e9es du layout [locale] (template de titre, valeurs par d\u00e9faut). */
export function buildLocaleLayoutMetadata(locale: Locale): Metadata {
  const verification = getGoogleSiteVerification();
  const defaults = SEO_DEFAULT_LAYOUT[locale];
  const defaultImage = absoluteUrl(DEFAULT_OG_IMAGE_PATH);
  const base: Metadata = {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: SITE_NAME,
      template: `%s | ${SITE_NAME}`,
    },
    description: defaults.description,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: getSiteUrl() }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      images: [defaultImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
  if (verification) {
    base.verification = { google: verification };
  }
  return base;
}

const SEO_DEFAULT_LAYOUT: Record<Locale, { description: string }> = {
  de: {
    description:
      'Level Up in Germany: Community, Mega-Konferenz, Mentorings und Netzwerk f\u00fcr internationale Talente in Deutschland.',
  },
  en: {
    description:
      'Level Up in Germany: community, mega conference, mentoring and network for international talent in Germany.',
  },
  fr: {
    description:
      'Level Up in Germany: communaut\u00e9, m\u00e9ga-conf\u00e9rence, mentorat et r\u00e9seau pour les talents internationaux en Allemagne.',
  },
};
