import type { Locale } from '@/i18n/config';

export type WhoWeAreStrings = {
  title: string;
  intro: string;
  story: {
    heading: string;
    lines: string[];
    /** Highlight block (the central question) */
    highlight: string;
    afterHighlight: string[];
  };
  vision: {
    heading: string;
    paragraphs: string[];
  };
  team: {
    heading: string;
    lead: string;
  };
  ctaContact: string;
};

const de: WhoWeAreStrings = {
  title: 'Wer wir sind',
  intro:
    'Zuerst das Team — danach unsere Geschichte und Vision. ',
  story: {
    heading: 'Unsere Geschichte',
    lines: ['Alles begann mit einer einfachen Frage:'],
    highlight: 'Warum muss jeder bei der Ankunft in Deutschland bei Null anfangen?',
    afterHighlight: [
      'Gespräche.',
      'Schwierige Anfänge.',
      'Ein Mangel an Orientierung, Netzwerk und Klarheit.',
      'Dann wurde es offenkundig:',
      'Manche sind schon weiter.',
      'Andere suchen noch ihren Weg.',
    ],
  },
  vision: {
    heading: 'Unsere Vision',
    paragraphs: [
      'Wir schaffen, was gefehlt hat:',
      'Eine Brücke.',
      'Zwischen denen, die auf dem Weg zum Erfolg sind, und denen, die schon weiter sind.',
      'Ein Raum, in dem Erfahrung weitergegeben wird, Fehler weniger werden und Chancen erreichbar werden.',
      'Vorankommen — vor allem aber: beschleunigen. Gemeinsam.',
    ],
  },
  team: {
    heading: 'Die Menschen hinter der Bewegung',
    lead: 'Acht engagierte Menschen, getragen von einer starken Überzeugung: Eine vernetzte Diaspora kann weiterkommen und noch stärker strahlen.',
  },
  ctaContact: 'Kontakt',
};

const en: WhoWeAreStrings = {
  title: 'Who we are',
  intro:
    'Meet the team first — then our story and vision. ',
  story: {
    heading: 'Our story',
    lines: ['It all began with a simple question:'],
    highlight: 'Why does everyone have to start from scratch when they arrive in Germany?',
    afterHighlight: [
      'Conversations.',
      'Difficult beginnings.',
      'A lack of bearings, network, and clarity.',
      'Then it became clear:',
      'Some are already moving forward.',
      'Others are still finding their way.',
    ],
  },
  vision: {
    heading: 'Our vision',
    paragraphs: [
      'To create what was missing:',
      'A bridge.',
      'Between those on the path to success and those who have already moved forward.',
      'A space where experience is passed on, mistakes shrink, and opportunities become within reach.',
      'To move forward — but above all, to accelerate. Together.',
    ],
  },
  team: {
    heading: 'The people behind the movement',
    lead: 'Eight committed people, united by a strong belief: a connected diaspora can go further and shine even brighter.',
  },
  ctaContact: 'Contact',
};

const fr: WhoWeAreStrings = {
  title: 'Qui sommes-nous ?',
  intro:
    'D\u2019abord l\u2019équipe, puis notre histoire et notre vision. ',
  story: {
    heading: 'Notre histoire',
    lines: ['Tout a commencé par une question simple :'],
    highlight: 'Pourquoi chacun doit-il recommencer de zéro en arrivant en Allemagne ?',
    afterHighlight: [
      'Des conversations.',
      'Des débuts difficiles.',
      'Un manque de repères, de réseau, de clarté.',
      'Puis une évidence :',
      'Certains avancent déjà.',
      'D\u2019autres cherchent encore leur voie.',
    ],
  },
  vision: {
    heading: 'Notre vision',
    paragraphs: [
      'Créer ce qui manquait :',
      'Un pont.',
      'Entre ceux qui sont sur le chemin du succès et ceux qui ont déjà avancé.',
      'Un espace où l\u2019expérience se transmet, où les erreurs se réduisent, où les opportunités deviennent accessibles.',
      'Avancer, mais surtout — accélérer. Ensemble.',
    ],
  },
  team: {
    heading: 'Les personnes derrière le mouvement',
    lead: 'Huit personnes engagées, portées par une conviction forte : une diaspora connectée peut aller plus loin et briller encore plus fort.',
  },
  ctaContact: 'Contact',
};

export const whoWeAreContent: Record<Locale, WhoWeAreStrings> = {
  de,
  en,
  fr,
};
