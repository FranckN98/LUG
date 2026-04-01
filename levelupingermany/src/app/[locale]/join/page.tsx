import React from 'react';
import { Form } from '@/components/Form';
import type { Locale } from '@/i18n/config';
import { getWhatsAppJoinUrl } from '@/config/whatsapp';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/join');
}

const content: Record<
  Locale,
  {
    title: string;
    intro: string;
    waTitle: string;
    waSubtitle: string;
    waCta: string;
    formLead: string;
    submit: string;
    consent: string;
    policy: string;
    sending: string;
    success: string;
    error: string;
  }
> = {
  de: {
    title: 'Mitglied werden',
    intro:
      'Tritt unserer WhatsApp-Community bei - dort bekommst du alle Infos zu Mentoring, Workshops und Events.',
    waTitle: 'Community auf WhatsApp',
    waSubtitle: 'Schnellster Weg, dabei zu sein: Gruppe oder Chat oeffnen und Hallo sagen.',
    waCta: 'Zu WhatsApp',
    formLead:
      'Alternativ kannst du dieses Formular nutzen - wir melden uns per E-Mail und du kannst danach in die Gruppe einsteigen.',
    submit: 'Mitgliedschaft anfragen',
    consent: 'Ich habe die Datenschutzerklaerung gelesen und stimme der Verarbeitung meiner Daten zu.',
    policy: 'Datenschutz',
    sending: 'Wird gesendet...',
    success: 'Danke! Wir haben deine Anfrage erhalten und melden uns per E-Mail.',
    error: 'Senden fehlgeschlagen. Bitte nutze WhatsApp oder versuche es spaeter erneut.',
  },
  en: {
    title: 'Join',
    intro: 'Join our WhatsApp community for mentoring, workshops and events.',
    waTitle: 'WhatsApp community',
    waSubtitle: 'Fastest way in: open the group or chat and say hello.',
    waCta: 'Open WhatsApp',
    formLead: 'You can also use this form - we will reply by email and you can join the group from there.',
    submit: 'Request membership',
    consent: 'I have read the privacy policy and agree to data processing.',
    policy: 'Privacy policy',
    sending: 'Sending...',
    success: 'Thank you! We received your request and will get back to you by email.',
    error: 'Something went wrong. Please use WhatsApp or try again later.',
  },
  fr: {
    title: 'Rejoindre',
    intro: 'Rejoignez notre communaute WhatsApp pour le mentorat, les ateliers et les evenements.',
    waTitle: 'Communaute WhatsApp',
    waSubtitle: 'Le plus rapide : ouvrez le groupe ou le chat et dites bonjour.',
    waCta: 'Ouvrir WhatsApp',
    formLead: 'Vous pouvez aussi utiliser ce formulaire - nous repondrons par e-mail.',
    submit: "Demander l adhesion",
    consent: 'J ai lu la politique de confidentialite et j accepte le traitement de mes donnees.',
    policy: 'Politique de confidentialite',
    sending: 'Envoi en cours...',
    success: 'Merci ! Nous avons bien recu votre demande et vous repondrons par e-mail.',
    error: "L'envoi a echoue. Utilisez WhatsApp ou reessayez plus tard.",
  },
};

export default async function JoinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];
  const base = `/${loc}`;
  const waUrl = getWhatsAppJoinUrl(loc);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t.title}</h1>
      <p className="text-gray-600 mb-8">{t.intro}</p>

      <div className="rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50 to-white p-6 sm:p-8 mb-10 shadow-sm">
        <h2 className="text-lg font-semibold text-primary mb-2">{t.waTitle}</h2>
        <p className="text-sm text-gray-600 mb-5">{t.waSubtitle}</p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-white font-semibold shadow-lg hover:bg-[#20bd5a] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <svg className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {t.waCta}
        </a>
      </div>

      <p className="text-sm text-gray-600 mb-4">{t.formLead}</p>
      <Form
        locale={loc}
        formType="join"
        fields={[
          { name: 'name', type: 'text', label: 'Name', required: true },
          { name: 'email', type: 'email', label: 'E-Mail', required: true },
          { name: 'city', type: 'text', label: loc === 'fr' ? 'Ville' : 'City', required: true },
          {
            name: 'language',
            type: 'select',
            label: loc === 'de' ? 'Sprache' : loc === 'fr' ? 'Langue' : 'Language',
            required: true,
            options: ['DE', 'EN', 'FR'],
          },
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
