'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import logoImage from '@/assets/logo.png';

type Props = { locale: 'de' | 'en' | 'fr' };

export function CookieBanner({ locale }: Props) {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('lug_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  if (!visible) return null;

  const base = `/${locale}`;
  const privacyHref = `${base}/privacy`;

  const copy = {
    de: {
      title: 'Ihre Datenschutzeinstellungen',
      before: 'Wir verwenden ausschließlich technisch notwendige Cookies. Mit Ihrer Einwilligung setzen wir zusätzlich Analyse-Cookies ein, um unsere Website zu verbessern. Details in der',
      link: 'Datenschutzerklärung',
      acceptAll: 'Alle akzeptieren',
      declineLabel: 'Nur notwendige',
      details: 'Notwendige Cookies gewährleisten Grundfunktionen (Sprache, Sicherheit). Sie können nicht deaktiviert werden.',
    },
    en: {
      title: 'Your privacy settings',
      before: 'We only use strictly necessary cookies. With your consent we also use analytics cookies to improve our site. See our',
      link: 'Privacy Policy',
      acceptAll: 'Accept all',
      declineLabel: 'Essential only',
      details: 'Necessary cookies ensure basic functions (language, security). They cannot be disabled.',
    },
    fr: {
      title: 'Vos préférences de confidentialité',
      before: 'Nous n\'utilisons que des cookies strictement nécessaires. Avec votre accord, nous utilisons également des cookies analytiques pour améliorer notre site. Détails dans la',
      link: 'politique de confidentialité',
      acceptAll: 'Tout accepter',
      declineLabel: 'Essentiels uniquement',
      details: 'Les cookies nécessaires assurent les fonctions de base (langue, sécurité). Ils ne peuvent pas être désactivés.',
    },
  }[locale];

  const accept = () => {
    localStorage.setItem('lug_cookie_consent', 'accepted');
    window.dispatchEvent(new Event('lug:consent-changed'));
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem('lug_cookie_consent', 'declined');
    window.dispatchEvent(new Event('lug:consent-changed'));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[440px] z-[80] rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
      <Link
        href={base}
        className="mb-3 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
        aria-label="Level Up in Germany – Start"
      >
        <img
          src={logoImage.src}
          alt=""
          width={280}
          height={76}
          className="h-12 w-auto max-w-[min(100%,280px)] object-contain object-left sm:h-14"
          aria-hidden
        />
      </Link>
      <p className="mb-1 text-sm font-semibold text-gray-900">{copy.title}</p>
      <p className="text-sm text-gray-600 leading-relaxed">
        {copy.before}{' '}
        <Link href={privacyHref} className="font-medium text-primary underline underline-offset-2 hover:text-primary-light">
          {copy.link}
        </Link>
        .
      </p>
      {showDetails && (
        <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500 leading-relaxed border border-gray-100">
          {copy.details}
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="mr-auto text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600 transition"
        >
          {showDetails ? '▲' : '▼'} {locale === 'fr' ? 'Détails' : locale === 'de' ? 'Details' : 'Details'}
        </button>
        <button
          type="button"
          onClick={decline}
          className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 text-sm font-medium hover:bg-gray-100 transition"
        >
          {copy.declineLabel}
        </button>
        <button
          type="button"
          onClick={accept}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-light transition shadow-sm"
        >
          {copy.acceptAll}
        </button>
      </div>
    </div>
  );
}
