'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { BusinessTourVideoPlayer } from '@/components/BusinessTourVideoPlayer';
import { PhotoStrip } from '@/components/PhotoStrip';
import { NextEditionNotifyForm } from '@/components/home/NextEditionNotifyForm';
import {
  ActionButton,
  ArrowIcon,
  ButtonLink,
  Eyebrow,
  HomeSection,
  IconBolt,
  IconBookOpen,
  IconCheck,
  IconEye,
  IconLightBulb,
  IconTrendingUp,
  IconUsers,
  Lead,
  SectionTitle,
} from '@/components/home/primitives';
import {
  HOME_PARTNERS_PHOTO,
  HOME_PARTNER_LOGOS_2025,
  HOME_PROOF_PHOTOS,
  HOME_VISION_PHOTO,
  homeSectionsCopy,
} from '@/content/homeSections';
import { SITE_CONTACT } from '@/config/siteContact';
import { eventEditionHref } from '@/lib/eventEditionRoutes';
import type { HomeNextEdition, HomeProofStat } from '@/lib/homeData';
import { trackEvent } from '@/lib/analytics';

const BUSINESS_TOUR_VIDEO_ID = 'VZ6tcyH1RDY';

const WHY_ICONS = [IconTrendingUp, IconLightBulb, IconUsers, IconBolt];
const PARTNER_AXIS_ICONS = [IconUsers, IconEye, IconBookOpen];

type Props = {
  base: string;
  locale: Locale;
  nextEdition: HomeNextEdition;
  proofStats: HomeProofStat[];
  /** Galerie du bas de page, gérée dans l'admin (Page d'accueil › Galerie communauté), séparée des images du Hero. */
  communityPhotos?: Array<{ src: string; alt?: string }>;
};

/** Photo en cadre à proportions fixes : recadrée (jamais déformée). Chemins locaux optimisés, URL externes en <img>. */
function Photo({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  if (src.startsWith('/')) {
    return <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />;
}

function PartnerLogo({ name, logo, website, zoom }: { name: string; logo: string; website?: string; zoom?: number }) {
  const tileClass =
    'flex h-20 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-3';
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo}
      alt={name}
      loading="lazy"
      decoding="async"
      className="max-h-full max-w-full object-contain"
      style={zoom ? { transform: `scale(${zoom})` } : undefined}
    />
  );
  if (!website) return <div className={tileClass}>{img}</div>;
  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className={`${tileClass} transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50`}
    >
      {img}
    </a>
  );
}

export function HomePageSections({ base, locale, nextEdition, proofStats, communityPhotos }: Props) {
  const c = homeSectionsCopy[locale];
  const open = nextEdition.state === 'open' ? nextEdition : null;
  const [tourPlaying, setTourPlaying] = useState(false);
  const tourRef = useRef<HTMLDivElement>(null);

  const ticketsHref = `${base}/buy-ticket`;
  const participateLabel = open ? c.next.openCta : c.next.notifyCta;
  const participateHref = open ? ticketsHref : '#prochaine-edition';
  const trackParticipate = (location: string) => {
    if (open) trackEvent('ticket_button_click', { button_location: location, language: locale });
  };

  const proofPhotos = HOME_PROOF_PHOTOS.map((src, i) => ({ src: src as string, alt: c.proof.photoAlts[i]! }));

  const playTour = () => {
    setTourPlaying(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    tourRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
  };

  const facts: { label: string; value?: string; link?: { href: string; label: string } }[] = open
    ? [
        {
          label: c.next.facts.dateLocation,
          value: [open.dateLabel, open.locationLabel].filter(Boolean).join(' · ') || undefined,
        },
        {
          label: c.next.facts.programme,
          link: open.programmeHref ? { href: `${base}${open.programmeHref}`, label: c.next.facts.programmeLink } : undefined,
        },
        {
          label: c.next.facts.tickets,
          value: open.ticketNames.join(' · ') || undefined,
          link: open.ticketNames.length ? { href: ticketsHref, label: c.next.facts.ticketsLink } : undefined,
        },
        { label: c.next.facts.price, value: open.priceFrom ? c.next.facts.priceFrom(open.priceFrom) : undefined },
      ].filter((f) => f.value || f.link)
    : [];

  return (
    <>
      {/* A — Notre vision */}
      <HomeSection id="vision" tone="white" labelledBy="home-vision-title">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <RevealOnScroll className="lg:col-span-6">
            <Eyebrow tone="white">{c.vision.eyebrow}</Eyebrow>
            <SectionTitle id="home-vision-title" tone="white">
              {c.vision.title}
            </SectionTitle>
            <Lead tone="white">{c.vision.body}</Lead>
            <p className="mt-8 max-w-2xl border-l-2 border-accent pl-5 text-lg font-medium leading-relaxed text-brand-dark">
              {c.vision.closing}
            </p>
          </RevealOnScroll>
          <RevealOnScroll delayMs={80} className="lg:col-span-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
              <Photo src={HOME_VISION_PHOTO} alt={c.vision.imageAlt} sizes="(min-width: 1024px) 560px, 100vw" />
            </div>
          </RevealOnScroll>
        </div>
      </HomeSection>

      {/* B — Level Up en action */}
      <HomeSection id="en-action" tone="neutral" labelledBy="home-proof-title">
        <RevealOnScroll>
          <div className="max-w-3xl">
            <Eyebrow tone="neutral">{c.proof.eyebrow}</Eyebrow>
            <SectionTitle id="home-proof-title" tone="neutral">
              {c.proof.title}
            </SectionTitle>
            <Lead tone="neutral">{c.proof.body}</Lead>
          </div>
        </RevealOnScroll>

        <RevealOnScroll delayMs={60}>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-4">
            {proofPhotos.map((photo, i) => (
              <div
                key={photo.src}
                className={`relative overflow-hidden rounded-2xl bg-gray-200 ${
                  i === 0 ? 'col-span-2 aspect-[3/2] sm:row-span-2 sm:aspect-auto' : 'aspect-[3/2]'
                }`}
              >
                <Photo src={photo.src} alt={photo.alt} sizes={i === 0 ? '(min-width: 640px) 50vw, 100vw' : '(min-width: 640px) 25vw, 50vw'} />
              </div>
            ))}
          </div>
        </RevealOnScroll>

        {proofStats.length > 0 && (
          <dl className="mt-12 grid gap-8 border-t border-gray-200 pt-10 sm:grid-cols-3">
            {proofStats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse gap-1">
                <dt className="text-sm text-gray-600">{stat.label}</dt>
                <dd className="font-display text-5xl font-semibold text-primary lining-nums">{stat.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-12 border-t border-gray-200 pt-10">
          <h3 className="text-sm font-semibold text-brand-dark">{c.proof.partnersTitle}</h3>
          <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {HOME_PARTNER_LOGOS_2025.map((partner) => (
              <li key={partner.name}>
                <PartnerLogo {...partner} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <ButtonLink href={eventEditionHref(locale, nextEdition.lastEdition)} variant="secondary" tone="neutral">
            {c.proof.cta}
          </ButtonLink>
        </div>
      </HomeSection>

      {/* C — Pourquoi participer */}
      <HomeSection id="pourquoi-participer" tone="white" labelledBy="home-why-title">
        <RevealOnScroll>
          <div className="max-w-3xl">
            <Eyebrow tone="white">{c.why.eyebrow}</Eyebrow>
            <SectionTitle id="home-why-title" tone="white">
              {c.why.title}
            </SectionTitle>
          </div>
        </RevealOnScroll>
        <ul className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {c.why.items.map((item, i) => {
            const Icon = WHY_ICONS[i]!;
            return (
              <li key={item.title}>
                <RevealOnScroll delayMs={(i % 2) * 60}>
                  <div className="flex gap-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold leading-snug text-brand-dark">{item.title}</h3>
                      <p className="mt-2 text-base leading-relaxed text-gray-600">{item.body}</p>
                    </div>
                  </div>
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>
      </HomeSection>

      {/* D — La prochaine édition */}
      <HomeSection id="prochaine-edition" tone="warm" labelledBy="home-next-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <RevealOnScroll className="lg:col-span-6">
            <Eyebrow tone="warm">{c.next.eyebrow}</Eyebrow>
            <SectionTitle id="home-next-title" tone="warm">
              {c.next.title}
            </SectionTitle>
            <Lead tone="warm">{c.next.body}</Lead>
            <div className="mt-8">
              {open ? (
                <ButtonLink href={ticketsHref} variant="primary" tone="warm" onClick={() => trackParticipate('home_next_edition')}>
                  {c.next.openCta}
                </ButtonLink>
              ) : (
                <NextEditionNotifyForm locale={locale} copy={c.next} submitLabel={c.next.notifyCta} />
              )}
            </div>
          </RevealOnScroll>

          <RevealOnScroll delayMs={80} className="lg:col-span-6">
            {open && facts.length > 0 ? (
              <dl className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white px-6">
                {facts.map((fact) => (
                  <div key={fact.label} className="grid gap-1 py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-600">{fact.label}</dt>
                    <dd className="text-base text-brand-dark">
                      {fact.value}
                      {fact.link && (
                        <span className={fact.value ? 'mt-1 block' : 'block'}>
                          <ButtonLink href={fact.link.href} variant="text" tone="warm">
                            {fact.link.label}
                          </ButtonLink>
                        </span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : !open ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
                <h3 className="text-lg font-semibold text-brand-dark">{c.next.pendingTitle}</h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">{c.next.pendingBody}</p>
              </div>
            ) : null}
          </RevealOnScroll>
        </div>
      </HomeSection>

      {/* E — Partenariats */}
      <HomeSection id="partenariats" tone="dark" labelledBy="home-partners-title">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <RevealOnScroll className="lg:col-span-7">
            <Eyebrow tone="dark">{c.partners.eyebrow}</Eyebrow>
            <SectionTitle id="home-partners-title" tone="dark" size="lg">
              {c.partners.title}
            </SectionTitle>
            <Lead tone="dark">{c.partners.body}</Lead>
          </RevealOnScroll>
          <RevealOnScroll delayMs={80} className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/5">
              <Photo src={HOME_PARTNERS_PHOTO} alt={c.partners.imageAlt} sizes="(min-width: 1024px) 440px, 100vw" />
            </div>
          </RevealOnScroll>
        </div>

        <ul className="mt-14 grid gap-10 border-t border-white/15 pt-10 md:grid-cols-3">
          {c.partners.axes.map((axis, i) => {
            const Icon = PARTNER_AXIS_ICONS[i]!;
            return (
              <li key={axis.title}>
                <RevealOnScroll delayMs={i * 60}>
                  <Icon className="h-7 w-7 text-accent" />
                  <h3 className="mt-4 text-lg font-semibold text-white">{axis.title}</h3>
                  <p className="mt-2 text-base leading-relaxed text-white/70">{axis.body}</p>
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">{c.partners.offersTitle}</h3>
            <ul className="mt-4 space-y-3">
              {c.partners.offers.map((offer) => (
                <li key={offer} className="flex items-start gap-3 text-base text-white/85">
                  <IconCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <span>{offer}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:justify-end">
            <ButtonLink
              href={`${base}/partners`}
              variant="primary"
              tone="dark"
              onClick={() => trackEvent('partner_button_click', { button_location: 'home_partners', language: locale })}
            >
              {c.partners.primaryCta}
            </ButtonLink>
            <ButtonLink href={`${base}/booth-reservation`} variant="text" tone="dark">
              {c.partners.secondaryLink}
            </ButtonLink>
          </div>
        </div>
      </HomeSection>

      {/* F — Business Tour */}
      <HomeSection id="business-tour" tone="white" labelledBy="home-tour-title">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <RevealOnScroll className="lg:col-span-5">
            <Eyebrow tone="white">{c.tour.eyebrow}</Eyebrow>
            <SectionTitle id="home-tour-title" tone="white">
              {c.tour.title}
            </SectionTitle>
            <Lead tone="white">{c.tour.body}</Lead>
            <div className="mt-8">
              <ActionButton variant="secondary" tone="white" onClick={playTour}>
                {c.tour.cta}
              </ActionButton>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delayMs={80} className="lg:col-span-7">
            <div ref={tourRef}>
              <BusinessTourVideoPlayer
                videoId={BUSINESS_TOUR_VIDEO_ID}
                locale={locale}
                title="Level Up Business Tour"
                tone="light"
                playing={tourPlaying}
                onPlay={() => setTourPlaying(true)}
              />
            </div>
          </RevealOnScroll>
        </div>
      </HomeSection>

      {/* G — Contribuer à la vision */}
      <HomeSection id="contribuer" tone="neutral" labelledBy="home-contribute-title">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <RevealOnScroll className="lg:col-span-6">
            <Eyebrow tone="neutral">{c.contribute.eyebrow}</Eyebrow>
            <SectionTitle id="home-contribute-title" tone="neutral">
              {c.contribute.title}
            </SectionTitle>
            <Lead tone="neutral">{c.contribute.body}</Lead>
          </RevealOnScroll>
          <RevealOnScroll delayMs={80} className="lg:col-span-6">
            <ul className="divide-y divide-gray-200 border-y border-gray-200">
              {c.contribute.options.map((option, i) => {
                const href = option.mailSubject
                  ? `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent(option.mailSubject)}`
                  : `${base}/contact`;
                return (
                  <li key={option.title}>
                    <a
                      href={href}
                      onClick={() => {
                        if (i === 1) trackEvent('speaker_apply_click', { button_location: 'home_contribute', language: locale });
                      }}
                      className="group flex min-h-[64px] items-center justify-between gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50"
                    >
                      <span>
                        <span className="block text-lg font-semibold text-brand-dark transition-colors group-hover:text-primary">
                          {option.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-gray-600">{option.hint}</span>
                      </span>
                      <ArrowIcon className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </RevealOnScroll>
        </div>
      </HomeSection>

      {/* Galerie communauté — alimentation et édition séparées du Hero */}
      {communityPhotos && communityPhotos.length > 0 && (
        <HomeSection id="communaute" tone="white" labelledBy="home-community-title">
          <RevealOnScroll>
            <div className="max-w-3xl">
              <Eyebrow tone="white">{c.community.eyebrow}</Eyebrow>
              <SectionTitle id="home-community-title" tone="white">
                {c.community.title}
              </SectionTitle>
            </div>
          </RevealOnScroll>
          <div className="-mx-4 mt-10 pl-4 sm:-mx-6 sm:pl-6">
            <PhotoStrip photos={communityPhotos} label={c.community.regionLabel} />
          </div>
          <p className="mt-5 text-xs text-gray-600">{c.community.hint}</p>
        </HomeSection>
      )}

      {/* H — Dernier appel à l'action */}
      <HomeSection tone="brand" labelledBy="home-final-title">
        <RevealOnScroll>
          <div className="mx-auto max-w-3xl text-center">
            <SectionTitle id="home-final-title" tone="brand" flush>
              {c.final.title}
            </SectionTitle>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/85">{c.final.body}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:flex-wrap sm:gap-5">
              <ButtonLink href={participateHref} variant="primary" tone="brand" large onClick={() => trackParticipate('home_final')}>
                {participateLabel}
              </ButtonLink>
              <ButtonLink href={`${base}/sponsor-donate`} variant="secondary" tone="brand">
                {c.final.partner}
              </ButtonLink>
              <ButtonLink href="#contribuer" variant="text" tone="brand">
                {c.final.contribute}
              </ButtonLink>
            </div>
          </div>
        </RevealOnScroll>
      </HomeSection>
    </>
  );
}
