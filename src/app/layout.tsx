import type { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { getSiteUrl } from '@/config/site';
import { InitialBrandLoader } from '@/components/InitialBrandLoader';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/** M\u00e9tadonn\u00e9es pour la page racine \u00ab choix de langue \u00bb ; les routes /[locale]/* enrichissent via leur layout. */
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: 'Level Up in Germany',
    template: '%s | Level Up in Germany',
  },
  description:
    'Level Up in Germany — choose your language: community, mega conference, mentoring and programmes in Germany.',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    siteName: 'Level Up in Germany',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f1eb' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the locale surfaced by middleware so <html lang> is correct on the
  // very first byte of HTML — required to prevent Chrome's auto-translate
  // from kicking in when the URL locale differs from the user's browser language.
  const h = await headers();
  const headerLocale = h.get('x-locale');
  const lang = headerLocale === 'de' || headerLocale === 'fr' ? headerLocale : 'en';

  return (
    <html lang={lang} className={`${dmSans.variable} ${cormorant.variable}`}>
      <head>
        {/* Disable automatic browser translation (Chrome / Edge / Safari). */}
        <meta name="google" content="notranslate" />
      </head>
      <body className="paper-texture antialiased min-h-screen font-sans">
        <InitialBrandLoader />
        <div className="paper-texture-shell min-h-screen">{children}</div>
      </body>
    </html>
  );
}
