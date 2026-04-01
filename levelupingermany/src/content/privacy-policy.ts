import type { Locale } from '@/i18n/config';

export type PrivacyBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] };

export type PrivacySection = {
  id: string;
  title: string;
  blocks: PrivacyBlock[];
};

export type PrivacyDocument = {
  title: string;
  metaDescription: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  intro: string;
  sections: PrivacySection[];
  impressumLinkLabel: string;
};

export const privacyPolicy: Record<Locale, PrivacyDocument> = {
  de: {
    title: 'Datenschutzerklärung',
    metaDescription:
      'Informationen zur Verarbeitung personenbezogener Daten gemäß DSGVO für die Website von Level Up in Germany.',
    lastUpdatedLabel: 'Stand:',
    lastUpdated: '12. März 2026',
    intro:
      'Wir nehmen den Schutz personenbezogener Daten ernst. Diese Datenschutzerklärung informiert Sie gemäß Art. 13 und 14 EU-Datenschutz-Grundverordnung (DSGVO) über Art, Umfang und Zweck der Verarbeitung personenbezogener Daten bei Nutzung dieser Website und unserer angebotenen Kontakt- und Anmeldeformulare.',
    impressumLinkLabel: 'Zum Impressum',
    sections: [
      {
        id: 'verantwortlicher',
        title: '1. Verantwortlicher',
        blocks: [
          {
            type: 'p',
            text:
              'Verantwortlicher im Sinne der DSGVO ist die im Impressum dieser Website genannte Organisation bzw. die dort angegebene vertretungsberechtigte Person. Die vollständigen Kontaktangaben (Name, Anschrift, erreichbare Kontaktmöglichkeiten) finden Sie im Impressum.',
          },
        ],
      },
      {
        id: 'allgemein',
        title: '2. Allgemeines zur Datenverarbeitung',
        blocks: [
          {
            type: 'p',
            text:
              'Personenbezogene Daten sind alle Informationen, die sich auf eine identifizierte oder identifizierbare natürliche Person beziehen. Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website, von Inhalten und Leistungen, zur Bearbeitung Ihrer Anfragen oder zur Erfüllung gesetzlicher Pflichten erforderlich ist oder Sie eingewilligt haben.',
          },
          {
            type: 'p',
            text:
              'Soweit wir für Verarbeitungsvorgänge eine Einwilligung einholen, ist Art. 6 Abs. 1 lit. a DSGVO Rechtsgrundlage. Bei der Verarbeitung von Daten zur Anbahnung oder Erfüllung eines Vertrags oder vorvertraglicher Maßnahmen ist Rechtsgrundlage Art. 6 Abs. 1 lit. b DSGVO. Soweit eine Verarbeitung zur Erfüllung einer rechtlichen Verpflichtung erforderlich ist, dient Art. 6 Abs. 1 lit. c DSGVO als Grundlage. Bei der Verarbeitung zur Wahrung berechtigter Interessen kann Art. 6 Abs. 1 lit. f DSGVO maßgeblich sein; berechtigtes Interesse kann insbesondere die Gewährleistung der IT-Sicherheit und der Missbrauchsprävention sein.',
          },
        ],
      },
      {
        id: 'hosting',
        title: '3. Hosting und technische Bereitstellung',
        blocks: [
          {
            type: 'p',
            text:
              'Die Website wird auf Servern eines Hosting-Anbieters betrieben. Dabei können automatisch technische Informationen verarbeitet werden, die Ihr Browser übermittelt (z. B. IP-Adresse, Datum und Uhrzeit der Anfrage, Browsertyp, Referrer-URL), soweit dies zur Auslieferung der Seiten und zur Gewährleistung der Stabilität und Sicherheit technisch erforderlich ist. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (Betrieb und Sicherheit des Online-Angebots).',
          },
        ],
      },
      {
        id: 'formulare',
        title: '4. Kontakt- und Anmeldeformulare',
        blocks: [
          {
            type: 'p',
            text:
              'Wenn Sie uns per Formular kontaktieren oder sich für Programme anmelden, verarbeiten wir die von Ihnen eingegebenen Daten (z. B. Name, E-Mail-Adresse, ggf. Stadt, Sprache, Freitextnachricht sowie formularspezifische Angaben) ausschließlich zur Bearbeitung Ihrer Anfrage bzw. zur Durchführung vorvertraglicher Maßnahmen oder zur Vertragserfüllung. Rechtsgrundlage ist je nach Sachverhalt Art. 6 Abs. 1 lit. b DSGVO und/oder Art. 6 Abs. 1 lit. a DSGVO, soweit Sie in zusätzliche Verarbeitungen (z. B. Fotoveröffentlichung) einwilligen.',
          },
          {
            type: 'p',
            text:
              'Die Übermittlung erfolgt verschlüsselt (HTTPS), soweit Ihr Browser dies unterstützt. Eine Weitergabe an Dritte erfolgt nicht zu Werbezwecken. Eine Übermittlung an Auftragsverarbeiter (z. B. Hosting, E-Mail-Versand) erfolgt nur im Rahmen der Auftragsverarbeitung gemäß Art. 28 DSGVO, soweit erforderlich.',
          },
        ],
      },
      {
        id: 'cookies',
        title: '5. Cookies und lokale Speicherung (Einwilligung)',
        blocks: [
          {
            type: 'p',
            text:
              'Wir können technisch notwendige Cookies oder vergleichbare Technologien verwenden, die für den Betrieb der Website unbedingt erforderlich sind. Darüber hinaus speichern wir mit Ihrer Einwilligung über das Cookie-Banner Informationen (z. B. Ihre Entscheidung zur Einwilligung) lokal im Browser (z. B. localStorage), soweit dies für die Nachweisbarkeit und Umsetzung Ihrer Präferenzen erforderlich ist.',
          },
          {
            type: 'p',
            text:
              'Rechtsgrundlage für nicht unbedingt erforderliche Cookies bzw. Speicherungen ist Ihre Einwilligung gemäß § 25 Abs. 1 TTDSG i. V. m. Art. 6 Abs. 1 lit. a DSGVO, soweit personenbezogene Daten betroffen sind. Sie können Ihre Einwilligung mit Wirkung für die Zukunft widerrufen, indem Sie gespeicherte Website-Daten in Ihrem Browser löschen; technisch notwendige Funktionen können davon ausgenommen sein.',
          },
        ],
      },
      {
        id: 'speicherdauer',
        title: '6. Speicherdauer und Löschung',
        blocks: [
          {
            type: 'p',
            text:
              'Wir speichern personenbezogene Daten nur so lange, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen. Anfragen aus Formularen werden nach Abschluss der Bearbeitung gelöscht, sofern keine Aufbewahrungspflichten oder berechtigten Interessen an einer längeren Speicherung entgegenstehen.',
          },
        ],
      },
      {
        id: 'rechte',
        title: '7. Ihre Rechte',
        blocks: [
          {
            type: 'p',
            text: 'Sie haben gegenüber uns folgende Rechte bezüglich der Sie betreffenden personenbezogenen Daten:',
          },
          {
            type: 'ul',
            items: [
              'Recht auf Auskunft (Art. 15 DSGVO)',
              'Recht auf Berichtigung (Art. 16 DSGVO)',
              'Recht auf Löschung (Art. 17 DSGVO)',
              'Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)',
              'Recht auf Datenübertragbarkeit (Art. 20 DSGVO)',
              'Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO), soweit die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO beruht',
              'Recht, eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft zu widerrufen (Art. 7 Abs. 3 DSGVO)',
            ],
          },
          {
            type: 'p',
            text:
              'Zur Ausübung Ihrer Rechte genügt eine Nachricht an die im Impressum angegebene Kontaktadresse. Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren (Art. 77 DSGVO). Zuständig ist insbesondere die Aufsichtsbehörde Ihres gewöhnlichen Aufenthaltsorts oder des Ortes des mutmaßlichen Verstoßes. Für Deutschland ist u. a. der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI) zuständig, sofern keine landesspezifische Zuständigkeit vorliegt.',
          },
        ],
      },
      {
        id: 'pflicht',
        title: '8. Bereitstellung von Daten',
        blocks: [
          {
            type: 'p',
            text:
              'Die Bereitstellung personenbezogener Daten ist weder gesetzlich noch vertraglich vorgeschrieben, kann aber für den Abschluss oder die Durchführung einer Mitgliedschaft oder die Bearbeitung Ihrer Anfrage erforderlich sein. Ohne bestimmte Angaben ist eine Bearbeitung ggf. nicht möglich.',
          },
        ],
      },
      {
        id: 'aenderungen',
        title: '9. Änderung dieser Datenschutzerklärung',
        blocks: [
          {
            type: 'p',
            text:
              'Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder Änderungen unserer Leistungen berücksichtigt. Für Ihren erneuten Besuch gilt die jeweils aktuelle Fassung.',
          },
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    metaDescription:
      'Information on the processing of personal data in accordance with the GDPR for the Level Up in Germany website.',
    lastUpdatedLabel: 'Last updated:',
    lastUpdated: '12 March 2026',
    intro:
      'We take the protection of personal data seriously. This privacy policy informs you in accordance with Articles 13 and 14 of the EU General Data Protection Regulation (GDPR) about the nature, scope and purpose of processing personal data when using this website and our contact and registration forms.',
    impressumLinkLabel: 'Go to legal notice (Imprint)',
    sections: [
      {
        id: 'controller',
        title: '1. Data controller',
        blocks: [
          {
            type: 'p',
            text:
              'The controller within the meaning of the GDPR is the organisation named in the legal notice (Imprint) of this website, or the representative indicated there. Full contact details (name, address, contact channels) are provided in the Imprint.',
          },
        ],
      },
      {
        id: 'general',
        title: '2. General information on processing',
        blocks: [
          {
            type: 'p',
            text:
              'Personal data means any information relating to an identified or identifiable natural person. We process personal data only insofar as this is necessary to provide a functional website, content and services, to handle your requests, to comply with legal obligations, or where you have given consent.',
          },
          {
            type: 'p',
            text:
              'Where we obtain consent for processing operations, the legal basis is Art. 6(1)(a) GDPR. Where processing is necessary for the performance of a contract or pre-contractual steps, the legal basis is Art. 6(1)(b) GDPR. Where processing is necessary for compliance with a legal obligation, Art. 6(1)(c) GDPR applies. Where processing is necessary for the purposes of legitimate interests, Art. 6(1)(f) GDPR may apply; legitimate interests may include IT security and abuse prevention.',
          },
        ],
      },
      {
        id: 'hosting',
        title: '3. Hosting and technical provision',
        blocks: [
          {
            type: 'p',
            text:
              'This website is operated on servers of a hosting provider. Technical information transmitted by your browser (e.g. IP address, date and time of the request, browser type, referrer URL) may be processed insofar as this is technically necessary to deliver the pages and ensure stability and security. The legal basis is Art. 6(1)(f) GDPR (operation and security of the online service).',
          },
        ],
      },
      {
        id: 'forms',
        title: '4. Contact and registration forms',
        blocks: [
          {
            type: 'p',
            text:
              'If you contact us via a form or register for programmes, we process the data you enter (e.g. name, email address, city, language, message text and form-specific information) solely to handle your request or for pre-contractual measures or performance of a contract. Depending on the case, the legal basis is Art. 6(1)(b) GDPR and/or Art. 6(1)(a) GDPR where you consent to additional processing (e.g. publication of photos).',
          },
          {
            type: 'p',
            text:
              'Transmission is encrypted (HTTPS) where supported by your browser. We do not share data with third parties for advertising purposes. Disclosure to processors (e.g. hosting, email delivery) only occurs under a data processing agreement pursuant to Art. 28 GDPR where necessary.',
          },
        ],
      },
      {
        id: 'cookies',
        title: '5. Cookies and local storage (consent)',
        blocks: [
          {
            type: 'p',
            text:
              'We may use strictly necessary cookies or similar technologies that are essential for operating the website. With your consent via the cookie banner, we may store information (e.g. your consent decision) locally in the browser (e.g. localStorage) where necessary to document and implement your preferences.',
          },
          {
            type: 'p',
            text:
              'The legal basis for non-essential cookies or storage is your consent under the ePrivacy rules (in Germany: Section 25(1) TTDSG) in conjunction with Art. 6(1)(a) GDPR where personal data is affected. You may withdraw consent with effect for the future by clearing site data in your browser; strictly necessary functions may be exempt.',
          },
        ],
      },
      {
        id: 'retention',
        title: '6. Retention and erasure',
        blocks: [
          {
            type: 'p',
            text:
              'We retain personal data only as long as necessary for the respective purposes or as required by statutory retention periods. Form enquiries are deleted after completion of processing unless retention obligations or overriding legitimate interests require longer storage.',
          },
        ],
      },
      {
        id: 'rights',
        title: '7. Your rights',
        blocks: [
          {
            type: 'p',
            text: 'You have the following rights regarding your personal data:',
          },
          {
            type: 'ul',
            items: [
              'Right of access (Art. 15 GDPR)',
              'Right to rectification (Art. 16 GDPR)',
              'Right to erasure (Art. 17 GDPR)',
              'Right to restriction of processing (Art. 18 GDPR)',
              'Right to data portability (Art. 20 GDPR)',
              'Right to object to processing (Art. 21 GDPR), where processing is based on Art. 6(1)(f) GDPR',
              'Right to withdraw consent at any time with effect for the future (Art. 7(3) GDPR)',
            ],
          },
          {
            type: 'p',
            text:
              'To exercise your rights, please contact the address given in the Imprint. You also have the right to lodge a complaint with a supervisory authority (Art. 77 GDPR), in particular in the Member State of your habitual residence or place of work or of the alleged infringement.',
          },
        ],
      },
      {
        id: 'provision',
        title: '8. Provision of data',
        blocks: [
          {
            type: 'p',
            text:
              'There is no statutory or contractual obligation to provide personal data; however, certain information may be necessary to conclude or perform membership or to process your request. Without it, processing may not be possible.',
          },
        ],
      },
      {
        id: 'changes',
        title: '9. Changes to this privacy policy',
        blocks: [
          {
            type: 'p',
            text:
              'We may update this privacy policy to reflect legal requirements or changes to our services. The version published on this page applies at the time of your visit.',
          },
        ],
      },
    ],
  },
  fr: {
    title: 'Politique de confidentialité',
    metaDescription:
      'Informations sur le traitement des données personnelles conformément au RGPD pour le site Level Up in Germany.',
    lastUpdatedLabel: 'Mise à jour :',
    lastUpdated: '12 mars 2026',
    intro:
      'Nous attachons une grande importance à la protection des données personnelles. La présente politique de confidentialité vous informe, conformément aux articles 13 et 14 du règlement général sur la protection des données (RGPD), de la nature, de l’étendue et des finalités du traitement des données personnelles lors de l’utilisation de ce site et de nos formulaires de contact et d’inscription.',
    impressumLinkLabel: 'Voir les mentions légales (Impressum)',
    sections: [
      {
        id: 'responsable',
        title: '1. Responsable du traitement',
        blocks: [
          {
            type: 'p',
            text:
              'Le responsable du traitement au sens du RGPD est l’organisation indiquée dans les mentions légales (Impressum) de ce site, ou la personne habilitée à représenter l’organisation. Les coordonnées complètes (nom, adresse, moyens de contact) figurent dans les mentions légales.',
          },
        ],
      },
      {
        id: 'general',
        title: '2. Principes généraux',
        blocks: [
          {
            type: 'p',
            text:
              'Les données à caractère personnel désignent toute information se rapportant à une personne physique identifiée ou identifiable. Nous ne traitons des données personnelles que dans la mesure où cela est nécessaire pour fournir un site fonctionnel, des contenus et des prestations, pour traiter vos demandes, pour respecter des obligations légales ou sur la base de votre consentement.',
          },
          {
            type: 'p',
            text:
              'Lorsque le traitement est fondé sur le consentement, la base juridique est l’article 6(1)(a) RGPD. Pour l’exécution d’un contrat ou de mesures précontractuelles : article 6(1)(b) RGPD. Pour le respect d’une obligation légale : article 6(1)(c) RGPD. Pour un intérêt légitime (sécurité informatique, lutte contre les abus) : article 6(1)(f) RGPD, le cas échéant.',
          },
        ],
      },
      {
        id: 'hebergement',
        title: '3. Hébergement et mise à disposition technique',
        blocks: [
          {
            type: 'p',
            text:
              'Le site est hébergé sur les serveurs d’un prestataire. Des informations techniques transmises par votre navigateur (adresse IP, date et heure de la requête, type de navigateur, URL de référence, etc.) peuvent être traitées dans la mesure où cela est techniquement nécessaire à la diffusion des pages et à la stabilité et la sécurité du service. La base juridique est l’article 6(1)(f) RGPD.',
          },
        ],
      },
      {
        id: 'formulaires',
        title: '4. Formulaires de contact et d’inscription',
        blocks: [
          {
            type: 'p',
            text:
              'Lorsque vous nous contactez par formulaire ou vous inscrit à un programme, nous traitons les données que vous saisissez (nom, adresse e-mail, ville, langue, message et informations propres au formulaire) uniquement pour traiter votre demande ou pour des mesures précontractuelles ou l’exécution d’un contrat. La base juridique est notamment l’article 6(1)(b) RGPD et, pour les traitements optionnels (publication de photos, etc.), l’article 6(1)(a) RGPD.',
          },
          {
            type: 'p',
            text:
              'La transmission a lieu de manière chiffrée (HTTPS) lorsque votre navigateur le permet. Aucune transmission à des tiers à des fins publicitaires. Les sous-traitants (hébergement, envoi d’e-mails) ne sont impliqués que dans le cadre d’un contrat de traitement conformément à l’article 28 RGPD, si nécessaire.',
          },
        ],
      },
      {
        id: 'cookies',
        title: '5. Cookies et stockage local (consentement)',
        blocks: [
          {
            type: 'p',
            text:
              'Nous pouvons utiliser des cookies strictement nécessaires au fonctionnement du site. Avec votre consentement via la bannière cookies, nous pouvons enregistrer localement dans le navigateur (par ex. localStorage) des informations relatives à votre choix, afin de le respecter et d’en garder la trace.',
          },
          {
            type: 'p',
            text:
              'La base juridique pour les cookies non strictement nécessaires est votre consentement, conformément à la directive ePrivacy et au droit national applicable, conjointement avec l’article 6(1)(a) RGPD lorsque des données personnelles sont concernées. Vous pouvez retirer votre consentement en effaçant les données du site dans votre navigateur.',
          },
        ],
      },
      {
        id: 'conservation',
        title: '6. Durée de conservation',
        blocks: [
          {
            type: 'p',
            text:
              'Nous conservons les données personnelles uniquement pendant la durée nécessaire aux finalités poursuivies ou imposée par la loi. Les demandes envoyées via formulaire sont supprimées après clôture du traitement, sauf obligation de conservation ou intérêt légitime à une conservation plus longue.',
          },
        ],
      },
      {
        id: 'droits',
        title: '7. Vos droits',
        blocks: [
          {
            type: 'p',
            text: 'Vous disposez des droits suivants concernant vos données personnelles :',
          },
          {
            type: 'ul',
            items: [
              'Droit d’accès (article 15 RGPD)',
              'Droit de rectification (article 16 RGPD)',
              'Droit à l’effacement (article 17 RGPD)',
              'Droit à la limitation du traitement (article 18 RGPD)',
              'Droit à la portabilité (article 20 RGPD)',
              'Droit d’opposition (article 21 RGPD), lorsque le traitement est fondé sur l’article 6(1)(f) RGPD',
              'Droit de retirer votre consentement à tout moment (article 7(3) RGPD)',
            ],
          },
          {
            type: 'p',
            text:
              'Pour exercer vos droits, adressez-vous aux coordonnées indiquées dans les mentions légales. Vous avez également le droit d’introduire une réclamation auprès d’une autorité de contrôle (article 77 RGPD), notamment dans l’État membre de votre résidence habituelle ou du lieu du litige.',
          },
        ],
      },
      {
        id: 'fourniture',
        title: '8. Fourniture des données',
        blocks: [
          {
            type: 'p',
            text:
              'La fourniture de données personnelles n’est ni légalement ni contractuellement obligatoire, mais peut être nécessaire pour adhérer ou pour traiter votre demande. Sans certaines informations, le traitement peut être impossible.',
          },
        ],
      },
      {
        id: 'modifications',
        title: '9. Modifications',
        blocks: [
          {
            type: 'p',
            text:
              'Nous pouvons adapter la présente politique de confidentialité pour la mettre en conformité avec la loi ou pour refléter l’évolution de nos services. La version publiée sur cette page fait foi au moment de votre visite.',
          },
        ],
      },
    ],
  },
};
