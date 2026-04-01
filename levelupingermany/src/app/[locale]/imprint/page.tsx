import React from 'react';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/imprint');
}

const content: Record<Locale, { title: string; body: string }> = {
  de: {
    title: 'Impressum',
    body:
      'Angaben gemaess Paragraph 5 DDG\n\nOrganisation: [LEVEL UP IN GERMANY e.V. / Organisation]\nAdresse: [Strasse, PLZ, Ort, Land]\nKontakt: [E-Mail], [Telefon optional]\nVertretungsberechtigte Person(en): [Name]\nRegistereintrag: [Vereinsregister/HRB + Nummer, falls vorhanden]\nUmsatzsteuer-ID: [falls vorhanden]\n\nRedaktionell verantwortlich:\n[Name, Adresse]\n\nHaftung fuer Inhalte und Links:\nWir sind fuer eigene Inhalte nach den allgemeinen Gesetzen verantwortlich. Fuer externe Links uebernehmen wir keine Gewaehr. Bei Bekanntwerden von Rechtsverstoessen entfernen wir Inhalte/Links umgehend.',
  },
  en: {
    title: 'Imprint',
    body:
      'Information according to German legal notice obligations (Paragraph 5 DDG)\n\nOrganization: [LEVEL UP IN GERMANY e.V. / Organization]\nAddress: [Street, ZIP, City, Country]\nContact: [Email], [Phone optional]\nLegal representative(s): [Name]\nRegistry details: [Registry + number, if available]\nVAT ID: [if available]\n\nEditorially responsible:\n[Name, Address]\n\nLiability notice:\nWe are responsible for our own content under applicable laws. We assume no liability for external links. We remove unlawful content/links upon notice.',
  },
  fr: {
    title: 'Mentions legales',
    body:
      "Informations legales (equivalent Impressum Allemagne)\n\nOrganisation: [LEVEL UP IN GERMANY e.V. / Organisation]\nAdresse: [Rue, Code postal, Ville, Pays]\nContact: [Email], [Telephone optionnel]\nRepresentant legal: [Nom]\nRegistre: [Registre + numero, si disponible]\nTVA: [si disponible]\n\nResponsable editorial:\n[Nom, Adresse]\n\nResponsabilite:\nNous sommes responsables de nos propres contenus selon la loi applicable. Nous ne sommes pas responsables des liens externes. Tout contenu illicite sera retire des notification.",
  },
};

export default async function ImprintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-primary mb-6">{t.title}</h1>
      <p className="whitespace-pre-line text-gray-700">{t.body}</p>
    </div>
  );
}
