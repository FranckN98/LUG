import React from 'react';
import { Form } from '@/components/Form';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/programme/workshops');
}

const content: Record<
  Locale,
  { title: string; intro: string; submit: string; consent: string; policy: string; sending: string; success: string; error: string }
> = {
  de: {
    title: 'Workshops',
    intro: 'Praktische Sessions zu Karriere, Leben und Netzwerken in Deutschland. Termine und Anmeldung unter Veranstaltungen.',
    submit: 'Workshop anmelden',
    consent: 'Ich stimme der Verarbeitung meiner Daten gemäß der',
    policy: 'Datenschutzerklärung',
    sending: 'Wird gesendet…',
    success: 'Anmeldung gesendet. Wir melden uns bei dir.',
    error: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
  },
  en: {
    title: 'Workshops',
    intro: 'Hands-on sessions on career, life and networking in Germany. See Events for dates and registration.',
    submit: 'Register workshop',
    consent: 'I agree to the processing of my data according to the',
    policy: 'Privacy Policy',
    sending: 'Sending…',
    success: 'Registration sent. We will get back to you.',
    error: 'Submission failed. Please try again.',
  },
  fr: {
    title: 'Ateliers',
    intro: 'Sessions pratiques sur la carriere, la vie et le reseau en Allemagne. Voir Evenements pour les dates et inscriptions.',
    submit: "S'inscrire à l'atelier",
    consent: "J'accepte le traitement de mes données selon la",
    policy: 'Politique de confidentialité',
    sending: 'Envoi en cours…',
    success: 'Inscription envoyee. Nous vous recontacterons.',
    error: "L'envoi a echoue. Reessayez.",
  },
};

export default async function WorkshopsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];
  const base = `/${loc}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
        {t.title}
      </h1>
      <p className="text-gray-600 mb-8">{t.intro}</p>
      <Form
        locale={loc}
        formType="workshop-registration"
        fields={[
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'email', type: 'email', label: 'E-Mail', required: true },
          { name: 'workshop', type: 'text', label: 'Workshop', required: true },
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
