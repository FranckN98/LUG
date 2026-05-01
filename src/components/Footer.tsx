import React from 'react';
import Link from 'next/link';
import { type Locale } from '@/i18n/config';
import { homeContent } from '@/content/home';
import { SITE_CONTACT, siteContactTelHref } from '@/config/siteContact';
import { SocialIcons } from '@/components/SocialIcons';
import { FooterLogo } from '@/components/FooterLogo';
import { FooterNewsletter } from '@/components/FooterNewsletter';
import { whoWeAreHref } from '@/lib/whoWeAreRoutes';

const footerLinks: { href: string; de: string; en: string; fr: string }[] = [
  { href: '/imprint', de: 'Impressum', en: 'Imprint', fr: 'Mentions légales' },
  { href: '/privacy', de: 'Datenschutz', en: 'Privacy', fr: 'Confidentialité' },
];

function NavColumn({
  title,
  children,
  ariaLabel,
}: {
  title: string;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <nav className="flex min-w-0 flex-col" aria-label={ariaLabel}>
      <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45">{title}</p>
      <ul className="flex flex-col gap-1.5 text-sm">{children}</ul>
    </nav>
  );
}

export function Footer({ locale, joinWhatsAppUrl }: { locale: Locale; joinWhatsAppUrl: string }) {
  const base = `/${locale}`;
  const t = homeContent[locale];
  const getLabel = (item: (typeof footerLinks)[0]) => item[locale];

  const contactPageHref = `${base}/contact`;

  const whoWeAreExploreLabel =
    locale === 'de' ? 'Wer wir sind' : locale === 'fr' ? 'Qui sommes-nous ?' : 'Who we are';

  const contactLabel =
    locale === 'de' ? 'Kontakt' : locale === 'fr' ? 'Contact' : 'Contact';
  const contactCtaLabel =
    locale === 'de' ? 'Kontakt' : locale === 'fr' ? 'Contact' : 'Contact';

  const exploreTitle =
    locale === 'de' ? 'Entdecken' : locale === 'en' ? 'Explore' : 'Découvrir';
  const legalTitle =
    locale === 'de' ? 'Rechtliches' : locale === 'en' ? 'Legal' : 'Mentions légales';

  const followLabel =
    locale === 'de' ? 'Folgen' : locale === 'fr' ? 'Suivre' : 'Follow';

  const socialLabels =
    locale === 'de'
      ? {
          whatsapp: 'Level Up in Germany auf WhatsApp (öffnet in neuem Tab)',
          linkedin: 'Level Up in Germany auf LinkedIn (öffnet in neuem Tab)',
          instagram: 'Level Up in Germany auf Instagram (öffnet in neuem Tab)',
          tiktok: 'Level Up in Germany auf TikTok (öffnet in neuem Tab)',
        }
      : locale === 'fr'
        ? {
            whatsapp: 'Level Up in Germany sur WhatsApp (nouvel onglet)',
            linkedin: 'Level Up in Germany sur LinkedIn (nouvel onglet)',
            instagram: 'Level Up in Germany sur Instagram (nouvel onglet)',
            tiktok: 'Level Up in Germany sur TikTok (nouvel onglet)',
          }
        : {
            whatsapp: 'Level Up in Germany on WhatsApp (opens in a new tab)',
            linkedin: 'Level Up in Germany on LinkedIn (opens in a new tab)',
            instagram: 'Level Up in Germany on Instagram (opens in a new tab)',
            tiktok: 'Level Up in Germany on TikTok (opens in a new tab)',
          };

  const linkClass =
    'text-brand-grey/95 hover:text-white transition-colors duration-200 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/80 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark';

  const tagline =
    locale === 'de'
      ? 'Mentoring, Events und Community für Ihren nächsten Schritt in Deutschland.'
      : locale === 'en'
        ? 'Mentoring, events and community for your next step in Germany.'
        : 'Mentorat, événements et communauté pour votre prochain pas en Allemagne.';

  return (
    <footer className="relative z-20 mt-auto border-t border-white/10 bg-gradient-to-b from-[#141414] via-brand-dark to-black text-brand-grey">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
        {/* ——— Partie 1 : marque — toujours en haut, alignée à gauche ——— */}
        <section
          className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] sm:px-6 sm:py-6"
          aria-label={locale === 'de' ? 'Marke' : locale === 'fr' ? 'Marque' : 'Brand'}
        >
          <div className="grid gap-6 sm:grid-cols-2 sm:items-start">
            <div className="flex max-w-xl flex-col items-start text-left">
              <FooterLogo homeHref={base} />
              <span className="sr-only">Level Up in Germany</span>
              <p className="mt-3 max-w-sm text-xs leading-snug text-white/65">{tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/40">{followLabel}</p>
                <SocialIcons compact labels={socialLabels} whatsappHref={joinWhatsAppUrl} className="justify-start" />
              </div>
              <Link
                href={contactPageHref}
                className="mt-4 inline-flex w-fit items-center justify-center rounded-full border border-accent/45 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition hover:border-accent hover:bg-accent hover:text-brand-dark"
              >
                {contactCtaLabel}
              </Link>
            </div>
            <div className="sm:pl-6 sm:border-l sm:border-white/10">
              <FooterNewsletter locale={locale} />
            </div>
          </div>
        </section>

        {/* ——— Partie 2 : liens, contact, copyright ——— */}
        <section className="mt-8 sm:mt-10" aria-label={locale === 'de' ? 'Navigation' : locale === 'fr' ? 'Navigation' : 'Site links'}>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-5 lg:gap-8">
            <NavColumn title={contactLabel} ariaLabel={contactLabel}>
              <li>
                <a href={`mailto:${SITE_CONTACT.email}`} className={`font-medium ${linkClass}`}>
                  {SITE_CONTACT.email}
                </a>
              </li>
              <li>
                <a href={siteContactTelHref(SITE_CONTACT.phoneDisplay)} className={`tabular-nums ${linkClass}`}>
                  {SITE_CONTACT.phoneDisplay}
                </a>
              </li>
              <li>
                <Link href={contactPageHref} className={`font-medium text-accent hover:text-accent-light ${linkClass}`}>
                  {locale === 'de' ? 'Nachricht schreiben' : locale === 'fr' ? 'Nous écrire' : 'Write to us'}
                </Link>
              </li>
              <li>
                <Link href={`${base}/partners`} className={linkClass}>
                  {t.contactPartners}
                </Link>
              </li>
            </NavColumn>

            <NavColumn title={exploreTitle} ariaLabel={exploreTitle}>
              <li>
                <a
                  href={joinWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  {locale === 'de' ? 'Mitglied werden (WhatsApp)' : locale === 'fr' ? 'Rejoindre (WhatsApp)' : 'Join (WhatsApp)'}
                </a>
              </li>
              <li>
                <Link href={whoWeAreHref(locale)} className={linkClass}>
                  {whoWeAreExploreLabel}
                </Link>
              </li>
            </NavColumn>

            <NavColumn title={legalTitle} ariaLabel={legalTitle}>
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link href={`${base}${item.href}`} className={linkClass}>
                    {getLabel(item)}
                  </Link>
                </li>
              ))}
            </NavColumn>
          </div>

          <div
            id="contact"
            className="mt-8 scroll-mt-24 flex flex-col gap-3 border-t border-white/10 pt-6 sm:mt-10 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div className="min-w-0">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-accent/90">{t.contactEyebrow}</p>
              <h2 className="mt-1 text-base font-semibold tracking-tight text-white">{t.contactTitle}</h2>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
              <Link
                href={`${base}/partners`}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/90 transition hover:border-white/25 hover:bg-white/[0.1]"
              >
                {t.contactPartners}
              </Link>
              <Link
                href={contactPageHref}
                className="inline-flex items-center rounded-full bg-accent/90 px-3 py-1.5 text-xs font-semibold text-brand-dark transition hover:bg-accent"
              >
                {t.contactBtn} →
              </Link>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
            <p className="text-center text-[0.7rem] text-white/35 sm:text-left">
              © {new Date().getFullYear()} Level Up in Germany
            </p>
            <p className="text-center text-[0.6rem] uppercase tracking-wider text-white/25">
              {locale === 'de' && 'Gemeinsam stark'}
              {locale === 'en' && 'Stronger together'}
              {locale === 'fr' && 'Ensemble, plus forts'}
            </p>
          </div>
        </section>
      </div>
    </footer>
  );
}
