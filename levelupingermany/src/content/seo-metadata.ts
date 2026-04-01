import type { Locale } from '@/i18n/config';

export type SeoEntry = { title: string; description: string; keywords?: string[] };

/** Cl\u00e9 = suffixe de chemin (ex. '' pour l\u2019accueil, '/events' pour les \u00e9v\u00e9nements). */
export const SEO_BY_PATH: Record<string, Record<Locale, SeoEntry>> = {
  '': {
    de: {
      title: 'Start',
      description:
        'Level Up in Germany verbindet internationale Studierende und Professionals mit Mentoring, Events und Community in Deutschland.',
      keywords: ['Level Up', 'Deutschland', 'Mentoring', 'Konferenz', 'Community'],
    },
    en: {
      title: 'Home',
      description:
        'Level Up in Germany connects international students and professionals with mentoring, events and community in Germany.',
      keywords: ['Level Up', 'Germany', 'mentoring', 'conference', 'community'],
    },
    fr: {
      title: 'Accueil',
      description:
        'Level Up in Germany relie \u00e9tudiants et professionnels internationaux au mentorat, \u00e9v\u00e9nements et communaut\u00e9 en Allemagne.',
      keywords: ['Level Up', 'Allemagne', 'mentorat', 'conf\u00e9rence'],
    },
  },
  '/about': {
    de: {
      title: '\u00dcber uns',
      description: 'Erfahren Sie mehr \u00fcber Level Up in Germany, unsere Mission und unser Netzwerk.',
    },
    en: {
      title: 'About',
      description: 'Learn more about Level Up in Germany, our mission and our network.',
    },
    fr: {
      title: '\u00c0 propos',
      description: 'En savoir plus sur Level Up in Germany, notre mission et notre r\u00e9seau.',
    },
  },
  '/who-we-are': {
    de: {
      title: 'Wer wir sind',
      description: 'Das Kernteam von Level Up in Germany: Menschen, Formate und Rollen hinter der Bewegung.',
    },
    en: {
      title: 'Who we are',
      description: 'Meet the core team behind Level Up in Germany: the people driving the movement.',
    },
    fr: {
      title: 'Qui sommes-nous ?',
      description:
        'L\u2019\u00e9quipe de Level Up in Germany: les visages et les r\u00f4les derri\u00e8re le mouvement.',
    },
  },
  '/events': {
    de: {
      title: 'Events',
      description:
        'Mega-Konferenz und Editionen von Level Up in Germany: Highlights, Galerien und Programme.',
    },
    en: {
      title: 'Events',
      description:
        'Level Up in Germany mega conference and editions: highlights, galleries and programmes.',
    },
    fr: {
      title: '\u00c9v\u00e9nements',
      description:
        'M\u00e9ga-conf\u00e9rence et \u00e9ditions Level Up in Germany: temps forts, galeries et programmes.',
    },
  },
  '/events/archives': {
    de: {
      title: 'Event-Archive',
      description: 'Archiv vergangener Veranstaltungen und Momente von Level Up in Germany.',
    },
    en: {
      title: 'Event archives',
      description: 'Archive of past Level Up in Germany events and highlights.',
    },
    fr: {
      title: 'Archives',
      description: 'Archives des \u00e9v\u00e9nements pass\u00e9s de Level Up in Germany.',
    },
  },
  '/events/levelup2025': {
    de: {
      title: 'Level Up in Germany 2025',
      description: 'R\u00fcckblick auf die Mega-Konferenz 2025: Programm, Galerie und Highlights.',
    },
    en: {
      title: 'Level Up in Germany 2025',
      description: 'Recap of the 2025 mega conference: programme, gallery and highlights.',
    },
    fr: {
      title: 'Level Up in Germany 2025',
      description: 'R\u00e9trospective de la m\u00e9ga-conf\u00e9rence 2025 : programme, galerie et temps forts.',
    },
  },
  '/events/levelup2026': {
    de: {
      title: 'Level Up in Germany 2026',
      description: 'N\u00e4chste Ausgabe 2026 in Frankfurt: Infos, Vorschau und Galerie.',
    },
    en: {
      title: 'Level Up in Germany 2026',
      description: 'Next 2026 edition in Frankfurt: updates, preview and gallery.',
    },
    fr: {
      title: 'Level Up in Germany 2026',
      description: 'Prochaine \u00e9dition 2026 \u00e0 Francfort : infos, aper\u00e7u et galerie.',
    },
  },
  '/programme': {
    de: {
      title: 'Programme',
      description: 'Workshops, Mentorings und Konferenzformate von Level Up in Germany.',
    },
    en: {
      title: 'Programmes',
      description: 'Workshops, mentoring and conference formats from Level Up in Germany.',
    },
    fr: {
      title: 'Programmes',
      description: 'Ateliers, mentorat et formats conf\u00e9rence de Level Up in Germany.',
    },
  },
  '/programme/workshops': {
    de: {
      title: 'Workshops',
      description: 'Praxisnahe Workshops zu Karriere, Business und Leben in Deutschland.',
    },
    en: {
      title: 'Workshops',
      description: 'Hands-on workshops on career, business and life in Germany.',
    },
    fr: {
      title: 'Ateliers',
      description: 'Ateliers concrets sur la carri\u00e8re, le business et la vie en Allemagne.',
    },
  },
  '/programme/mentoring': {
    de: {
      title: 'Mentoring',
      description: 'Mentoring Circles und MentorBridge: Peer-Learning und Orientierung.',
    },
    en: {
      title: 'Mentoring',
      description: 'Mentoring Circles and MentorBridge: peer learning and clarity for your next step.',
    },
    fr: {
      title: 'Mentorat',
      description: 'Cercles de mentorat et MentorBridge: pair-learning et \u00e9clairage.',
    },
  },
  '/programme/conference': {
    de: {
      title: 'Konferenz',
      description: 'Die Jahreskonferenz von Level Up in Germany: Inspiration auf einer B\u00fchne.',
    },
    en: {
      title: 'Conference',
      description: 'The annual Level Up in Germany conference: inspiration on one stage.',
    },
    fr: {
      title: 'Conf\u00e9rence',
      description: 'La conf\u00e9rence annuelle Level Up in Germany : inspiration sur une sc\u00e8ne.',
    },
  },
  '/annual-conference': {
    de: {
      title: 'Jahreskonferenz',
      description: 'Die Mega-Konferenz: Programm, Speaker und Community-Erlebnis.',
    },
    en: {
      title: 'Annual conference',
      description: 'The mega conference: programme, speakers and community experience.',
    },
    fr: {
      title: 'Conf\u00e9rence annuelle',
      description: 'La m\u00e9ga-conf\u00e9rence : programme, intervenants et exp\u00e9rience communautaire.',
    },
  },
  '/partners': {
    de: {
      title: 'Partner',
      description: 'Partner, Hochschulen und Sponsoren, die Level Up in Germany tragen.',
    },
    en: {
      title: 'Partners',
      description: 'Partners, universities and sponsors supporting Level Up in Germany.',
    },
    fr: {
      title: 'Partenaires',
      description: 'Partenaires, universit\u00e9s et sponsors qui soutiennent Level Up in Germany.',
    },
  },
  '/blog-impact': {
    de: {
      title: 'Blog & Impact',
      description: 'Stories, Impact und Einblicke aus der Community von Level Up in Germany.',
    },
    en: {
      title: 'Blog & Impact',
      description: 'Stories, impact and insights from the Level Up in Germany community.',
    },
    fr: {
      title: 'Blog & Impact',
      description: 'R\u00e9cits, impact et regards sur la communaut\u00e9 Level Up in Germany.',
    },
  },
  '/contact': {
    de: {
      title: 'Kontakt',
      description: 'Kontaktieren Sie Level Up in Germany: Fragen zu Mitgliedschaft, Events oder Kooperationen.',
    },
    en: {
      title: 'Contact',
      description: 'Contact Level Up in Germany: membership, events or partnerships.',
    },
    fr: {
      title: 'Contact',
      description: 'Contactez Level Up in Germany : adh\u00e9sion, \u00e9v\u00e9nements ou partenariats.',
    },
  },
  '/join': {
    de: {
      title: 'Mitglied werden',
      description: 'Teil der Community werden: Mitgliedschaft und WhatsApp-Gruppe.',
    },
    en: {
      title: 'Join',
      description: 'Join the Level Up in Germany community: membership and WhatsApp.',
    },
    fr: {
      title: 'Rejoindre',
      description: 'Rejoindre la communaut\u00e9 Level Up in Germany : adh\u00e9sion et WhatsApp.',
    },
  },
  '/sponsor-donate': {
    de: {
      title: 'Sponsor & Spenden',
      description: 'Unterst\u00fctzen Sie Level Up in Germany: Sponsoring und Spenden.',
    },
    en: {
      title: 'Sponsor & donate',
      description: 'Support Level Up in Germany through sponsorship and donations.',
    },
    fr: {
      title: 'Sponsor & don',
      description: 'Soutenez Level Up in Germany : sponsoring et dons.',
    },
  },
  '/services': {
    de: {
      title: 'Services',
      description: 'Angebote und Services von Level Up in Germany.',
    },
    en: {
      title: 'Services',
      description: 'Services and offers from Level Up in Germany.',
    },
    fr: {
      title: 'Services',
      description: 'Services et offres de Level Up in Germany.',
    },
  },
  '/buy-ticket': {
    de: {
      title: 'Tickets',
      description: 'Tickets und Teilnahme an Level Up in Germany Events.',
    },
    en: {
      title: 'Tickets',
      description: 'Tickets and attendance for Level Up in Germany events.',
    },
    fr: {
      title: 'Billets',
      description: 'Billets et participation aux \u00e9v\u00e9nements Level Up in Germany.',
    },
  },
  '/imprint': {
    de: {
      title: 'Impressum',
      description: 'Impressum und rechtliche Angaben zu Level Up in Germany.',
    },
    en: {
      title: 'Imprint',
      description: 'Legal notice and imprint information for Level Up in Germany.',
    },
    fr: {
      title: 'Mentions l\u00e9gales',
      description: 'Mentions l\u00e9gales et informations relatives \u00e0 Level Up in Germany.',
    },
  },
  '/privacy': {
    de: {
      title: 'Datenschutz',
      description: 'Datenschutzerkl\u00e4rung von Level Up in Germany: Verarbeitung personenbezogener Daten.',
    },
    en: {
      title: 'Privacy',
      description: 'Privacy policy for Level Up in Germany: how we handle personal data.',
    },
    fr: {
      title: 'Confidentialit\u00e9',
      description: 'Politique de confidentialit\u00e9 de Level Up in Germany : traitement des donn\u00e9es.',
    },
  },
};

export function getSeoForPath(pathSuffix: string, locale: Locale): SeoEntry {
  const key = pathSuffix === '' ? '' : pathSuffix.startsWith('/') ? pathSuffix : `/${pathSuffix}`;
  const block = SEO_BY_PATH[key];
  if (block) return block[locale];
  return {
    title: 'Level Up in Germany',
    description: 'Level Up in Germany – community, events and programmes.',
  };
}
