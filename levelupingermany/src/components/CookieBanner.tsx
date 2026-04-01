'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import logoImage from '@/assets/logo.png';

type Props = { locale: 'de' | 'en' | 'fr' };

export function CookieBanner({ locale }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('lug_cookie_consent');
    if (!accepted) setVisible(true);
  }, []);

  if (!visible) return null;

  const base = `/${locale}`;
  const privacyHref = `${base}/privacy`;

  const copy = {
    de: {
      before: 'Wir verwenden Cookies bzw. lokale Speicherung, soweit technisch nötig oder nach Ihrer Einwilligung. Details in der',
      link: 'Datenschutzerklärung',
    },
    en: {
      before: 'We use cookies or local storage where technically necessary or with your consent. See our',
      link: 'Privacy Policy',
    },
    fr: {
      before: 'Nous utilisons des cookies ou le stockage local lorsque c’est nécessaire ou avec votre consentement. Détails dans la',
      link: 'politique de confidentialité',
    },
  }[locale];

  const accept = () => {
    localStorage.setItem('lug_cookie_consent', 'accepted');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-[80] rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
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
      <p className="text-sm text-gray-700">
        {copy.before}{' '}
        <Link href={privacyHref} className="font-medium text-primary underline underline-offset-2 hover:text-primary-light">
          {copy.link}
        </Link>
        .
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={accept}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition"
        >
          {locale === 'de' ? 'Akzeptieren' : locale === 'fr' ? 'Accepter' : 'Accept'}
        </button>
      </div>
    </div>
  );
}
