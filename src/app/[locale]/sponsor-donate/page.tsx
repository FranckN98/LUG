
import React from 'react';
import { Form } from '@/components/Form';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { generateMetadataForPath } from '@/lib/seo';
import { FsconPdfViewer } from '@/components/FsconPdfViewer';
import { getFeaturedSponsorPdfUrl, listPublicSponsorDocs, publicShareUrl } from '@/lib/sponsorDocuments';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/sponsor-donate');
}

const content: Record<Locale, {
  eyebrow: string; title: string; intro: string;
  donateTitle: string; donateBody: string;
  ibanLabel: string; iban: string; bic: string; paypal: string;
  formTitle: string; formBody: string;
  submit: string; consent: string; policy: string; sending: string; success: string; error: string;
  whyTitle: string;
  perks: { title: string; body: string }[];
}> = {
  de: {
    eyebrow: 'Unterstützung',
    title: 'Sponsor / Spenden',
    intro: 'Jede Unterstützung bringt uns näher ans Ziel: eine Diaspora, die zusammen wächst und gemeinsam weiter kommt.',
    donateTitle: 'Direkt spenden',
    donateBody: 'Ihre Spende fließt direkt in Events, Mentoring-Programme und Community-Ressourcen.',
    ibanLabel: 'Banküberweisung',
    iban: 'IBAN: DE00 0000 0000 0000 0000 00',
    bic: 'BIC: ABCDDEFFXXX',
    paypal: 'Via PayPal spenden',
    formTitle: 'Sponsoring-Anfrage',
    formBody: 'Sie möchten uns als Unternehmen oder Organisation unterstützen? Senden Sie uns Ihre Anfrage.',
    submit: 'Anfrage senden',
    consent: 'Ich stimme der Verarbeitung meiner Daten gemäß der',
    policy: 'Datenschutzerklärung',
    sending: 'Wird gesendet…',
    success: 'Anfrage gesendet. Wir melden uns bald!',
    error: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
    whyTitle: 'Warum uns unterstützen?',
    perks: [
      { title: 'Direkte Wirkung', body: 'Ihre Mittel erreichen direkt die Menschen, die sie brauchen — keine langen Bürokratiewege.' },
      { title: 'Sichtbarkeit', body: 'Als Sponsor erscheinen Sie auf unserer Website, bei Events und in allen Kommunikationskanälen.' },
      { title: 'Gemeinschaft', body: 'Sie werden Teil einer wachsenden, engagierten Diaspora-Community in Deutschland.' },
    ],
  },
  en: {
    eyebrow: 'Support us',
    title: 'Sponsor / Donate',
    intro: 'Every contribution brings us closer to our goal: a diaspora that grows together and goes further together.',
    donateTitle: 'Donate directly',
    donateBody: 'Your donation goes directly into events, mentoring programmes and community resources.',
    ibanLabel: 'Bank transfer',
    iban: 'IBAN: DE00 0000 0000 0000 0000 00',
    bic: 'BIC: ABCDDEFFXXX',
    paypal: 'Donate via PayPal',
    formTitle: 'Sponsorship request',
    formBody: 'Want to support us as a company or organisation? Send us your request.',
    submit: 'Send request',
    consent: 'I agree to the processing of my data according to the',
    policy: 'Privacy Policy',
    sending: 'Sending…',
    success: 'Request sent. We will get back to you soon!',
    error: 'Submission failed. Please try again.',
    whyTitle: 'Why support us?',
    perks: [
      { title: 'Direct impact', body: 'Your funds reach directly the people who need them — no lengthy bureaucracy.' },
      { title: 'Visibility', body: 'As a sponsor, you appear on our website, at events and across all communication channels.' },
      { title: 'Community', body: 'You become part of a growing, engaged diaspora community in Germany.' },
    ],
  },
  fr: {
    eyebrow: 'Nous soutenir',
    title: 'Sponsor / Don',
    intro: 'Chaque contribution nous rapproche de notre objectif : une diaspora qui grandit ensemble et avance ensemble.',
    donateTitle: 'Faire un don directement',
    donateBody: 'Votre don va directement aux événements, programmes de mentorat et ressources communautaires.',
    ibanLabel: 'Virement bancaire',
    iban: 'IBAN : DE00 0000 0000 0000 0000 00',
    bic: 'BIC : ABCDDEFFXXX',
    paypal: 'Donner via PayPal',
    formTitle: 'Demande de sponsoring',
    formBody: 'Vous souhaitez nous soutenir en tant qu\'entreprise ou organisation ? Envoyez-nous votre demande.',
    submit: 'Envoyer la demande',
    consent: 'J\'accepte le traitement de mes données selon la',
    policy: 'Politique de confidentialité',
    sending: 'Envoi en cours…',
    success: 'Demande envoyée. Nous vous répondrons bientôt !',
    error: 'L\'envoi a échoué. Réessayez.',
    whyTitle: 'Pourquoi nous soutenir ?',
    perks: [
      { title: 'Impact direct', body: 'Vos fonds atteignent directement les personnes qui en ont besoin — sans longue bureaucratie.' },
      { title: 'Visibilité', body: 'En tant que sponsor, vous apparaissez sur notre site, lors des événements et sur tous nos canaux.' },
      { title: 'Communauté', body: 'Vous faites partie d\'une communauté diaspora croissante et engagée en Allemagne.' },
    ],
  },
};

export default async function SponsorDonatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const t = content[loc];
  const base = `/${loc}`;
  const featuredPdfUrl = await getFeaturedSponsorPdfUrl();
  const allDocs = await listPublicSponsorDocs();
  const featuredDoc = allDocs.find((d) => d.isFeatured);
  const featuredPdfLink = featuredDoc ? publicShareUrl(featuredDoc.slug, featuredDoc.url) : featuredPdfUrl;
  const shareableDocs = allDocs.filter((d) => !d.isFeatured);

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_30%,rgba(233,140,11,0.22),transparent_50%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_80%,rgba(140,26,26,0.5),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)`, backgroundSize: '64px 64px' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20 pt-24 sm:pt-28 w-full">
          <RevealOnScroll>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-accent mb-4">{t.eyebrow}</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-display leading-[1.02] max-w-3xl">{t.title}</h1>
            <p className="mt-5 text-base sm:text-lg text-white/65 max-w-xl leading-relaxed">{t.intro}</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── WHY + DONATE ── */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[#0d0806]" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(233,140,11,0.12),transparent)]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-14 md:gap-20">

            {/* Why */}
            <RevealOnScroll>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-10 bg-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{t.whyTitle}</p>
              </div>
              <div className="space-y-4">
                {t.perks.map((perk, i) => (
                  <div key={i} className="flex gap-5 rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/8 hover:border-accent/30">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-sm font-bold">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{perk.title}</h3>
                      <p className="text-sm text-white/60 leading-relaxed">{perk.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </RevealOnScroll>

            {/* Donate */}
            <RevealOnScroll delayMs={100}>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-px w-10 bg-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{t.donateTitle}</p>
              </div>
              <p className="text-white/65 text-base leading-relaxed mb-6">{t.donateBody}</p>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-accent/70">{t.ibanLabel}</p>
                {/* IBAN flouté */}
                <p className="font-mono text-white/80 text-sm blur-sm select-none" title="IBAN masqué pour sécurité">{t.iban}</p>
                <p className="font-mono text-white/80 text-sm blur-sm select-none" title="BIC masqué pour sécurité">{t.bic}</p>
                <div className="pt-2">
                  <a
                    href="https://www.paypal.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-brand-dark hover:bg-accent-light hover:scale-[1.02] transition-all duration-300"
                  >
                    {t.paypal} →
                  </a>
                </div>
              </div>
              {/* PDF FSCon intégré, agrandi, sans description */}
              <div className="mt-8 flex flex-col items-center gap-2">
                <FsconPdfViewer src={featuredPdfUrl} />
                <a
                  href={featuredPdfLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline text-sm hover:text-accent-light transition-colors mt-2"
                >
                  Ouvrir le PDF dans un nouvel onglet
                </a>
                {shareableDocs.length > 0 && (
                  <div className="mt-8 w-full max-w-4xl space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-accent/80">
                      Autres documents
                    </p>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {shareableDocs.map((d) => (
                        <li
                          key={d.id}
                          className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-accent/40 transition-colors"
                        >
                          <a
                            href={publicShareUrl(d.slug, d.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3"
                          >
                            <span className="mt-0.5 inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-accent/15 text-accent">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
                              </svg>
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold text-white">{d.title}</span>
                              {d.description && (
                                <span className="block text-xs text-white/60 mt-0.5 line-clamp-2">{d.description}</span>
                              )}
                              <span className="block text-[0.7rem] text-accent/80 mt-1">Ouvrir le PDF →</span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ── SPONSOR FORM ── */}
      <section className="relative py-20 sm:py-28 bg-white overflow-hidden">
        <div className="absolute left-0 top-16 bottom-16 w-1 bg-gradient-to-b from-transparent via-accent to-transparent rounded-full" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-14 md:gap-20 items-start">
            <RevealOnScroll>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-10 bg-accent" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{t.formTitle}</p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-semibold text-brand-dark text-balance mb-4 leading-tight">{t.formBody}</h2>
              <p className="text-gray-500 text-base leading-relaxed">
                {loc === 'fr' ? 'Nous vous répondons dans les 48h.' : loc === 'de' ? 'Wir antworten innerhalb von 48h.' : 'We reply within 48 hours.'}
              </p>
              <div className="mt-8">
                <Link href={`/${loc}/partners`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-light transition-colors">
                  ← {loc === 'fr' ? 'Voir nos partenaires' : loc === 'de' ? 'Unsere Partner ansehen' : 'See our partners'}
                </Link>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delayMs={100}>
              <Form
                locale={loc}
                formType="sponsor-inquiry"
                fields={[
                  { name: 'name', type: 'text', label: 'Name', required: true },
                  { name: 'organization', type: 'text', label: loc === 'fr' ? 'Organisation' : 'Organization', required: true },
                  { name: 'email', type: 'email', label: 'E-Mail', required: true },
                  { name: 'message', type: 'textarea', label: 'Message', required: true },
                ]}
                submitLabel={t.submit}
                consentLabel={t.consent}
                consentLinkHref={`${base}/privacy`}
                consentLinkText={t.policy}
                sendingLabel={t.sending}
                successMessage={t.success}
                errorMessage={t.error}
              />
            </RevealOnScroll>
          </div>
        </div>
      </section>

    </div>
  );
}
