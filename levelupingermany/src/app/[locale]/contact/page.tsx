import React from 'react';
import { Form } from '@/components/Form';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/contact');
}

const labels: Record<Locale, Record<string, string>> = {
  de: {
    title: 'Kontakt',
    intro: 'Schreiben Sie uns – wir melden uns schnellstmöglich.',
    submitLabel: 'Senden',
    consentLabel: 'Ich stimme der Verarbeitung meiner Daten gemäß der',
    consentLinkText: 'Datenschutzerklärung',
    sending: 'Wird gesendet…',
    success: 'Nachricht gesendet. Wir melden uns bald.',
    error: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
  },
  en: {
    title: 'Contact',
    intro: 'Get in touch – we will get back to you as soon as possible.',
    submitLabel: 'Send',
    consentLabel: 'I agree to the processing of my data according to the',
    consentLinkText: 'Privacy Policy',
    sending: 'Sending…',
    success: 'Message sent. We will get back to you soon.',
    error: 'Submission failed. Please try again.',
  },
  fr: {
    title: 'Contact',
    intro: 'Écrivez-nous – nous vous répondrons au plus tôt.',
    submitLabel: 'Envoyer',
    consentLabel: "J'accepte le traitement de mes données selon la",
    consentLinkText: 'Politique de confidentialité',
    sending: 'Envoi en cours…',
    success: 'Message envoyé. Nous vous repondrons bientot.',
    error: "L'envoi a echoue. Reessayez.",
  },
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = labels[loc];
  const base = `/${loc}`;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
        {t.title}
      </h1>
      <p className="text-gray-600 mb-8">{t.intro}</p>
      <Form
        locale={loc}
        formType="contact"
        fields={[
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'email', type: 'email', label: 'E-Mail', required: true },
          { name: 'message', type: 'textarea', label: loc === 'de' ? 'Nachricht' : loc === 'fr' ? 'Message' : 'Message', required: true },
        ]}
        submitLabel={t.submitLabel}
        consentLabel={t.consentLabel}
        consentLinkHref={`${base}/privacy`}
        consentLinkText={t.consentLinkText}
        sendingLabel={t.sending}
        successMessage={t.success}
        errorMessage={t.error}
      />
    </div>
  );
}
