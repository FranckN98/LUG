import React from 'react';
import { Form } from '@/components/Form';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/programme/mentoring');
}

const content: Record<
  Locale,
  { title: string; intro: string; submit: string; consent: string; policy: string; sending: string; success: string; error: string }
> = {
  de: {
    title: 'Mentoring (MentorBridge)',
    intro: 'Erfahrene Mentor:innen begleiten dich persönlich. Bei Interesse nutze das Kontaktformular oder die Anmeldung unter Join.',
    submit: 'Mentor anfragen',
    consent: 'Ich stimme der Verarbeitung meiner Daten gemäß der',
    policy: 'Datenschutzerklärung',
    sending: 'Wird gesendet…',
    success: 'Anfrage gesendet. Wir melden uns bei dir.',
    error: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
  },
  en: {
    title: 'Mentoring (MentorBridge)',
    intro: 'Experienced mentors support you one-to-one. Use the contact form or Join to register your interest.',
    submit: 'Request a mentor',
    consent: 'I agree to the processing of my data according to the',
    policy: 'Privacy Policy',
    sending: 'Sending…',
    success: 'Request sent. We will get back to you.',
    error: 'Submission failed. Please try again.',
  },
  fr: {
    title: 'Mentorat (MentorBridge)',
    intro: 'Des mentors expérimentés vous accompagnent. Utilisez le formulaire de contact ou la page Rejoindre pour vous inscrire.',
    submit: 'Demander un mentor',
    consent: "J'accepte le traitement de mes données selon la",
    policy: 'Politique de confidentialité',
    sending: 'Envoi en cours…',
    success: 'Demande envoyee. Nous vous recontacterons.',
    error: "L'envoi a echoue. Reessayez.",
  },
};

export default async function MentoringPage({
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
        formType="mentor-request"
        fields={[
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'email', type: 'email', label: 'E-Mail', required: true },
          { name: 'goal', type: 'textarea', label: loc === 'de' ? 'Ziel' : loc === 'fr' ? 'Objectif' : 'Goal', required: true },
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
