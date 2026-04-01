import React from 'react';
import { Form } from '@/components/Form';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/sponsor-donate');
}

const content: Record<
  Locale,
  {
    title: string;
    intro: string;
    iban: string;
    bic: string;
    submit: string;
    consent: string;
    policy: string;
    sending: string;
    success: string;
    error: string;
  }
> = {
  de: {
    title: 'Sponsor / Spenden',
    intro: 'Unterstuetze unsere Community durch Spenden oder Event-Sponsoring.',
    iban: 'IBAN: DE00 0000 0000 0000 0000 00',
    bic: 'BIC: ABCDDEFFXXX',
    submit: 'Sponsoring-Anfrage senden',
    consent: 'Ich stimme der Verarbeitung meiner Daten gemaess Datenschutzerklaerung zu.',
    policy: 'Datenschutz',
    sending: 'Wird gesendet?',
    success: 'Anfrage gesendet. Danke!',
    error: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
  },
  en: {
    title: 'Sponsor / Donate',
    intro: 'Support our community with donations or event sponsorship.',
    iban: 'IBAN: DE00 0000 0000 0000 0000 00',
    bic: 'BIC: ABCDDEFFXXX',
    submit: 'Send sponsorship request',
    consent: 'I agree to data processing according to the privacy policy.',
    policy: 'Privacy policy',
    sending: 'Sending?',
    success: 'Request sent. Thank you!',
    error: 'Submission failed. Please try again.',
  },
  fr: {
    title: 'Sponsor / Don',
    intro: 'Soutenez notre communaute via un don ou un sponsoring d evenement.',
    iban: 'IBAN: DE00 0000 0000 0000 0000 00',
    bic: 'BIC: ABCDDEFFXXX',
    submit: 'Envoyer une demande de sponsoring',
    consent: 'J accepte le traitement de mes donnees selon la politique de confidentialite.',
    policy: 'Politique de confidentialite',
    sending: 'Envoi en cours?',
    success: 'Demande envoyee. Merci !',
    error: "L'envoi a echoue. Reessayez.",
  },
};

export default async function SponsorDonatePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];
  const base = `/${loc}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t.title}</h1>
      <p className="text-gray-600 mb-6">{t.intro}</p>

      <div className="rounded-xl border border-gray-200 bg-white p-5 mb-8">
        <h2 className="font-semibold text-primary mb-2">Bank transfer</h2>
        <p className="text-sm text-gray-700">{t.iban}</p>
        <p className="text-sm text-gray-700">{t.bic}</p>
        <a href="https://www.paypal.com" target="_blank" rel="noreferrer" className="inline-block mt-3 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-dark transition">PayPal Donate</a>
      </div>

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
    </div>
  );
}
