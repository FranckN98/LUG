import type { Locale } from '@/i18n/config';
import {
  EVENT_2025_GALLERY_PATHS,
  EVENT_2026_GALLERY_PATHS,
  detail2025De,
  detail2025En,
  detail2025Fr,
  type ProgrammeBlock,
} from '@/content/events-2025-detail';

export type EventEdition = '2025' | '2026';

export type Speaker = {
  name: string;
  role: string;
  domain: string;
  image?: string;
};

export type ProgrammeItem = {
  time: string;
  title: string;
  desc?: string;
};

export type EventHighlight = { title: string; body: string };

export type EventData = {
  /** Thème / slogan de l'édition (affiché en grand dans le cadre rouge) */
  theme?: string;
  tagline?: string;
  timeRange?: string;
  programmeTitle?: string;
  programmeSubtitle?: string;
  /** Si false, le prix n’est pas affiché (hero + encadré date). */
  showPrice?: boolean;
  /** Placeholder visuel flouté (ex. 2026 avant annonce officielle). */
  priceBlurred?: boolean;
  price?: string;
  /** Image de fond optionnelle sous le dégradé (ex. bannière promo). */
  heroBackgroundImage?: string;
  audience?: string;
  programme: ProgrammeItem[];
  programmeBlocks?: ProgrammeBlock[];
  speakers: Speaker[];
  venue: { name: string; address: string; city: string; room?: string };
  date: string;
  dateShort?: string;
  partners?: string[];
  highlights?: EventHighlight[];
  contact?: { email?: string; phone?: string; instagram?: string };
  gallery: string[];
  galleryIntro?: string;
  videos: { id: string; title: string }[];
  /** Lien public vers le PDF du livre (1re éd.) — fichier dans public/downloads/ */
  firstEditionBookUrl?: string;
};

const gallery2025 = [...EVENT_2025_GALLERY_PATHS];

const eventsContent: Record<
  Locale,
  {
    title: string;
    eyebrow: string;
    archivesLink: string;
    intro: string;
    /** Page d\u00e9di\u00e9e /events/levelup2025 */
    introDedicated2025: string;
    /** Page d\u00e9di\u00e9e /events/levelup2026 */
    introDedicated2026: string;
    tab2025: string;
    tab2026: string;
    backToEvents: string;
    openEdition: string;
    speakersSeeMore: string;
    speakersSeeLess: string;
    downloadBookTitle: string;
    downloadBookSubtitle: string;
    /** Modal PDF / newsletter (gated download) */
    pdfModalTitle: string;
    pdfModalIntro: string;
    pdfEmailLabel: string;
    pdfSubmitLabel: string;
    pdfSendingLabel: string;
    pdfSuccessMessage: string;
    pdfConsentLabel: string;
    pdfPrivacyLinkText: string;
    /** Annonce accessibilité quand le prix est volontairement flouté */
    priceBlurredAria: string;
    sections: {
      programme: string;
      speakers: string;
      venue: string;
      date: string;
      gallery: string;
      videos: string;
      comingSoon: string;
      partners: string;
      highlights: string;
      contact: string;
      time: string;
      price: string;
      audience: string;
      galleryPrev: string;
      galleryNext: string;
      /** Placeholders: {current}, {total} (1-based page numbers) */
      galleryPageInfo: string;
    };
    edition2025: EventData;
    edition2026: EventData;
  }
> = {
  de: {
    title: 'Events',
    eyebrow: 'Editionen',
    archivesLink: 'Archive anzeigen',
    intro:
      'Entdecken Sie die Editionen von Level Up in Germany – ihre Höhepunkte, Redner, prägenden Momente und die Vision jedes Events.',
    introDedicated2025:
      'Level Up in Germany 2025 – Rückblick auf die Mega-Konferenz: Programm, Galerie und Highlights.',
    introDedicated2026:
      'Level Up in Germany 2026 – kommende Ausgabe in Frankfurt: Stand, Vorschau und Galerie.',
    tab2025: 'Level Up in Germany 2025',
    tab2026: 'Level Up in Germany 2026',
    backToEvents: '← Alle Editionen',
    openEdition: 'Edition öffnen',
    speakersSeeMore: 'Mehr anzeigen',
    speakersSeeLess: 'Weniger anzeigen',
    downloadBookTitle: 'Buch der 1. Ausgabe herunterladen',
    downloadBookSubtitle: 'Rückblick, Highlights & Impulse · PDF',
    pdfModalTitle: 'PDF per E-Mail erhalten',
    pdfModalIntro:
      'Geben Sie Ihre E-Mail ein. Sie erhalten den Download-Link und können das PDF sofort öffnen.',
    pdfEmailLabel: 'E-Mail-Adresse',
    pdfSubmitLabel: 'PDF erhalten',
    pdfSendingLabel: 'Wird gesendet…',
    pdfSuccessMessage:
      'Danke! Prüfen Sie Ihre E-Mails — wir haben den Link zum PDF gesendet. Der Download wurde in einem neuen Tab geöffnet.',
    pdfConsentLabel:
      'Ich möchte Neuigkeiten zu Level Up erhalten und habe die Datenschutzerklärung zur Kenntnis genommen (optional).',
    pdfPrivacyLinkText: 'Datenschutz',
    priceBlurredAria: 'Teilnahmepreis wird noch bekannt gegeben.',
    sections: {
      programme: 'Programm',
      speakers: 'Redner:innen & Gäste',
      venue: 'Ort',
      date: 'Datum',
      gallery: 'Galerie',
      videos: 'Videos',
      comingSoon: 'In Kürze',
      partners: 'Partner & Sponsoren',
      highlights: 'Das erwartet Sie',
      contact: 'Kontakt',
      time: 'Uhrzeit',
      price: 'Teilnahme',
      audience: 'Zielgruppe',
      galleryPrev: 'Zurück',
      galleryNext: 'Weiter',
      galleryPageInfo: 'Seite {current} von {total}',
    },
    edition2025: {
      ...detail2025De,
      programme: [],
      venue: {
        name: 'Frankfurt am Main',
        address: 'Mega-Konferenz · 1. Ausgabe',
        city: 'Deutschland',
        room: 'Details zur Location auf Anfrage / über die Anmeldung',
      },
      date: 'Samstag, 4. Oktober 2025',
      dateShort: '04.10.2025',
      gallery: [...gallery2025],
      videos: [],
      showPrice: false,
      firstEditionBookUrl: '/downloads/level-up-livre-1re-edition.pdf',
    },
    edition2026: {
      programme: [],
      speakers: [],
      theme: 'In Kürze',
      tagline: 'Mega-Konferenz · Ausgabe 2026 · Frankfurt',
      timeRange: '09h00 – 18h00',
      showPrice: false,
      priceBlurred: true,
      price: '40 €',
      audience: 'Studierende / Azubis · Berufstätige · Neuankömmlinge',
      heroBackgroundImage: '/events/2026/mega-hero-banner.png',
      venue: {
        name: 'Frankfurt am Main',
        address: 'Mega-Konferenz · 2. Ausgabe',
        city: 'Deutschland',
        room: 'Genauer Termin und Ort werden in Kürze bekannt gegeben.',
      },
      date: 'Datum folgt in Kürze',
      dateShort: '2026',
      gallery: [...EVENT_2026_GALLERY_PATHS],
      videos: [],
      firstEditionBookUrl: '/downloads/level-up-livre-1re-edition.pdf',
    },
  },
  en: {
    title: 'Events',
    eyebrow: 'Editions',
    archivesLink: 'Open archives',
    intro:
      'Discover the editions of Level Up in Germany – their highlights, speakers, memorable moments and the vision behind each event.',
    introDedicated2025:
      'Level Up in Germany 2025 – Mega conference recap: programme, gallery and highlights.',
    introDedicated2026:
      'Level Up in Germany 2026 – next edition in Frankfurt: status, preview and gallery.',
    tab2025: 'Level Up in Germany 2025',
    tab2026: 'Level Up in Germany 2026',
    backToEvents: '← All editions',
    openEdition: 'Open edition',
    speakersSeeMore: 'Show more',
    speakersSeeLess: 'Show less',
    downloadBookTitle: 'Download the 1st edition book',
    downloadBookSubtitle: 'Recap, highlights & takeaways · PDF',
    pdfModalTitle: 'Get the PDF by email',
    pdfModalIntro:
      'Enter your email address. We will send you the download link and open the PDF in a new tab.',
    pdfEmailLabel: 'Email address',
    pdfSubmitLabel: 'Receive the PDF',
    pdfSendingLabel: 'Sending…',
    pdfSuccessMessage:
      'Thank you! Check your inbox — we sent the PDF link. The download should have opened in a new tab.',
    pdfConsentLabel:
      'I would like to receive updates about Level Up and I have read the privacy policy (optional).',
    pdfPrivacyLinkText: 'Privacy',
    priceBlurredAria: 'Ticket price will be announced later.',
    sections: {
      programme: 'Programme',
      speakers: 'Speakers & guests',
      venue: 'Venue',
      date: 'Date',
      gallery: 'Gallery',
      videos: 'Videos',
      comingSoon: 'Coming soon',
      partners: 'Partners & sponsors',
      highlights: 'What to expect',
      contact: 'Contact',
      time: 'Time',
      price: 'Ticket',
      audience: 'Who it’s for',
      galleryPrev: 'Previous',
      galleryNext: 'Next',
      galleryPageInfo: 'Page {current} of {total}',
    },
    edition2025: {
      ...detail2025En,
      programme: [],
      venue: {
        name: 'Frankfurt am Main',
        address: 'Mega Conference · 1st edition',
        city: 'Germany',
        room: 'Venue details via registration / on request',
      },
      date: 'Saturday, October 4, 2025',
      dateShort: 'Oct 4, 2025',
      gallery: [...gallery2025],
      videos: [],
      showPrice: false,
      firstEditionBookUrl: '/downloads/level-up-livre-1re-edition.pdf',
    },
    edition2026: {
      programme: [],
      speakers: [],
      theme: 'Coming soon',
      tagline: 'Mega Conference · 2026 edition · Frankfurt',
      timeRange: '09h00 – 18h00',
      showPrice: false,
      priceBlurred: true,
      price: '40 €',
      audience: 'Students / apprentices · Workers · Newcomers',
      heroBackgroundImage: '/events/2026/mega-hero-banner.png',
      venue: {
        name: 'Frankfurt am Main',
        address: 'Mega Conference · 2nd edition',
        city: 'Germany',
        room: 'Exact date and venue will be announced soon.',
      },
      date: 'Date coming soon',
      dateShort: '2026',
      gallery: [...EVENT_2026_GALLERY_PATHS],
      videos: [],
      firstEditionBookUrl: '/downloads/level-up-livre-1re-edition.pdf',
    },
  },
  fr: {
    title: 'Événements',
    eyebrow: 'Éditions',
    archivesLink: 'Voir les archives',
    intro:
      'Découvrez les éditions de Level Up in Germany à travers leurs temps forts, leurs intervenants, leurs moments marquants et la vision portée par chaque événement.',
    introDedicated2025:
      'Level Up in Germany 2025 – rétrospective de la méga-conférence : programme, galerie et temps forts.',
    introDedicated2026:
      'Level Up in Germany 2026 – prochaine édition à Francfort : infos, aperçu et galerie.',
    tab2025: 'Level Up in Germany 2025',
    tab2026: 'Level Up in Germany 2026',
    backToEvents: '← Toutes les éditions',
    openEdition: 'Ouvrir l’édition',
    speakersSeeMore: 'Voir plus',
    speakersSeeLess: 'Voir moins',
    downloadBookTitle: 'Télécharger le livre de la 1re édition',
    downloadBookSubtitle: 'Retour sur l’événement, temps forts & pistes · PDF',
    pdfModalTitle: 'Recevoir le PDF par e-mail',
    pdfModalIntro:
      'Indiquez votre adresse e-mail. Nous vous enverrons le lien de téléchargement et ouvrirons le PDF dans un nouvel onglet.',
    pdfEmailLabel: 'Adresse e-mail',
    pdfSubmitLabel: 'Recevoir le PDF',
    pdfSendingLabel: 'Envoi en cours…',
    pdfSuccessMessage:
      'Merci ! Vérifiez votre boîte mail — nous avons envoyé le lien vers le PDF. Le téléchargement s’est ouvert dans un nouvel onglet.',
    pdfConsentLabel:
      'Je souhaite recevoir des actualités sur Level Up et j’ai pris connaissance de la politique de confidentialité (optionnel).',
    pdfPrivacyLinkText: 'Confidentialité',
    priceBlurredAria: 'Le tarif sera communiqué prochainement.',
    sections: {
      programme: 'Programme',
      speakers: 'Intervenants & invités',
      venue: 'Lieu',
      date: 'Date',
      gallery: 'Galerie',
      videos: 'Vidéos',
      comingSoon: 'Bientôt',
      partners: 'Partenaires & sponsors',
      highlights: 'Au programme',
      contact: 'Contact',
      time: 'Horaires',
      price: 'Participation',
      audience: 'Public',
      galleryPrev: 'Précédent',
      galleryNext: 'Suivant',
      galleryPageInfo: 'Page {current} sur {total}',
    },
    edition2025: {
      ...detail2025Fr,
      programme: [],
      venue: {
        name: 'Francfort-sur-le-Main',
        address: 'Mega conférence · 1re édition',
        city: 'Allemagne',
        room: 'Lieu précis communiqué à l’inscription / sur demande',
      },
      date: 'Samedi 4 octobre 2025',
      dateShort: '04.10.2025',
      gallery: [...gallery2025],
      videos: [],
      showPrice: false,
      firstEditionBookUrl: '/downloads/level-up-livre-1re-edition.pdf',
    },
    edition2026: {
      programme: [],
      speakers: [],
      theme: 'Bientôt',
      tagline: 'Mega conférence · Édition 2026 · Francfort',
      timeRange: '09h00 – 18h00',
      showPrice: false,
      priceBlurred: true,
      price: '40 €',
      audience: 'Étudiants / Azubi · Travailleurs · Nouveaux arrivants',
      heroBackgroundImage: '/events/2026/mega-hero-banner.png',
      venue: {
        name: 'Francfort-sur-le-Main',
        address: 'Mega conférence · 2e édition',
        city: 'Allemagne',
        room: 'Date exacte et lieu précis seront communiqués prochainement.',
      },
      date: 'Date à venir',
      dateShort: '2026',
      gallery: [...EVENT_2026_GALLERY_PATHS],
      videos: [],
      firstEditionBookUrl: '/downloads/level-up-livre-1re-edition.pdf',
    },
  },
};

export const eventsCopy = eventsContent;
