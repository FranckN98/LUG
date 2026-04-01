'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, localeNames, type Locale } from '@/i18n/config';
import { isWhoWeArePathname, localeSwitcherHref, whoWeAreHref } from '@/lib/whoWeAreRoutes';

// Même pictogramme que la favicon (icône U / flèche, bandes orange–rouge–noir)
import navLogoImage from '@/assets/lug-mark-nobg.png';

/** Même taille sur toutes les pages (évite le saut accueil ↔ autres routes). */
const LOGO_SIZE_CLASS =
  'h-11 w-11 sm:h-14 sm:w-14 md:h-[3.75rem] md:w-[3.75rem]';

function Logo() {
  const [error, setError] = useState(false);
  const logoSrc = navLogoImage.src;

  return (
    <>
      <img
        src={logoSrc}
        alt="Level Up in Germany"
        className={`${LOGO_SIZE_CLASS} shrink-0 rounded-xl object-contain object-center ring-1 ring-black/5 shadow-sm origin-center hover:scale-105 hover:shadow-md hover:ring-accent/25 transition-[transform,box-shadow,ring-color] duration-300 ease-out ${error ? 'hidden' : ''}`}
        width={120}
        height={120}
        fetchPriority="high"
        onError={() => setError(true)}
      />
      {error && (
        <span className="text-primary font-bold text-lg sm:text-xl whitespace-nowrap">
          Level Up in Germany
        </span>
      )}
    </>
  );
}

const navItems: { href: string; de: string; en: string; fr: string }[] = [
  { href: '', de: 'Start', en: 'Home', fr: 'Accueil' },
  { href: '/events', de: 'Events', en: 'Events', fr: 'Événements' },
  { href: '/who-we-are', de: 'Wer wir sind', en: 'Who we are', fr: 'Qui sommes-nous ?' },
  { href: '/partners', de: 'Partner', en: 'Partners', fr: 'Partenaires' },
  { href: '/blog-impact', de: 'Blog & Impact', en: 'Blog & Impact', fr: 'Blog & Impact' },
];

export function Header({ locale, joinWhatsAppUrl }: { locale: Locale; joinWhatsAppUrl: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const base = `/${locale}`;
  const getLabel = (item: (typeof navItems)[0]) => item[locale];
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20 md:h-[5.5rem]">
          <Link
            href={base}
            className="shrink-0 flex items-center min-h-[56px] h-16 sm:h-20 md:h-[5.5rem] py-1"
            aria-label="Level Up in Germany – Start"
          >
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const href =
                item.href === '/who-we-are' ? whoWeAreHref(locale) : item.href ? `${base}${item.href}` : base;
              const isActive =
                item.href === '/who-we-are'
                  ? isWhoWeArePathname(pathname)
                  : pathname === href || (item.href ? pathname.startsWith(href) : false);
              return (
                <Link
                  key={item.href || 'home'}
                  href={href}
                  className={`text-sm font-medium transition ${
                    isActive
                      ? 'text-primary border-b-2 border-primary'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {getLabel(item)}
                </Link>
              );
            })}
            <a
              href={joinWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition"
            >
              {locale === 'de' && 'Mitglied werden'}
              {locale === 'en' && 'Join'}
              {locale === 'fr' && 'Rejoindre'}
            </a>
            <Link
              href={`${base}/sponsor-donate`}
              className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-dark transition"
            >
              {locale === 'de' && 'Sponsor / Spenden'}
              {locale === 'en' && 'Sponsor / Donate'}
              {locale === 'fr' && 'Sponsor / Don'}
            </Link>
            <LocaleSwitcher currentLocale={locale} pathname={pathname} />
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <LocaleSwitcher currentLocale={locale} pathname={pathname} />
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const href =
                  item.href === '/who-we-are' ? whoWeAreHref(locale) : item.href ? `${base}${item.href}` : base;
                return (
                  <li key={item.href || 'home'}>
                    <Link
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                      {getLabel(item)}
                    </Link>
                  </li>
                );
              })}
              <li>
                <a
                  href={joinWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg bg-primary text-white font-medium"
                >
                  {locale === 'de' && 'Mitglied werden'}
                  {locale === 'en' && 'Join'}
                  {locale === 'fr' && 'Rejoindre'}
                </a>
              </li>
              <li>
                <Link
                  href={`${base}/sponsor-donate`}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg bg-accent text-white font-medium"
                >
                  {locale === 'de' && 'Sponsor / Spenden'}
                  {locale === 'en' && 'Sponsor / Donate'}
                  {locale === 'fr' && 'Sponsor / Don'}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}

function LocaleSwitcher({
  currentLocale,
  pathname,
}: {
  currentLocale: Locale;
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const persistLocale = (loc: Locale) => {
    // Persist language for future visits (1 year)
    document.cookie = `lug_locale=${loc}; path=/; max-age=31536000; samesite=lax`;
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex items-center gap-1.5 min-w-[4.5rem] px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-primary hover:bg-gray-50 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Sprache wählen"
      >
        <span>{localeNames[currentLocale].slice(0, 2).toUpperCase()}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute right-0 top-full mt-1 min-w-[7rem] py-1 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
          role="listbox"
        >
          {locales.map((loc) => (
            <li key={loc} role="option" aria-selected={loc === currentLocale}>
              <Link
                href={localeSwitcherHref(pathname, loc)}
                className={`block px-3 py-2 text-sm transition-colors ${
                  loc === currentLocale
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => {
                  persistLocale(loc);
                  setOpen(false);
                }}
              >
                {localeNames[loc]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
