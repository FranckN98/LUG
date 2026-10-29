import type { Locale } from '@/i18n/config';
import type { ProgrammeBlock, ProgrammeItem, ProgrammeTrack } from '@/content/events-2025-detail';

/**
 * Programme officiel de Level Up in Germany — 2e édition, samedi 17 octobre 2026.
 * Horaires et noms sont identiques dans toutes les langues ; titres et descriptions existent en FR / EN / DE.
 * Les noms des parcours (Career Launch…) sont ceux des billets : ils ne sont pas traduits.
 */

type L = Record<Locale, string>;
const l = (fr: string, en: string, de: string): L => ({ fr, en, de });

type RawItem = Omit<ProgrammeItem, 'title' | 'desc'> & { title: L; desc?: L };

const pick = (items: RawItem[], locale: Locale): ProgrammeItem[] =>
  items.map(({ title, desc, ...rest }) => ({ ...rest, title: title[locale], ...(desc ? { desc: desc[locale] } : {}) }));

const pause = (time: string, title: L, desc: L): RawItem => ({ time, title, desc, kind: 'break' });

const opening: RawItem[] = [
  pause(
    '08:00–08:45',
    l('Accueil des invités', 'Guest Check-In', 'Gäste-Check-in'),
    l('Enregistrement · Café de bienvenue · Networking', 'Registration · Welcome coffee · Networking', 'Registrierung · Willkommenskaffee · Networking'),
  ),
  {
    time: '08:45–09:00',
    title: l('Ouverture officielle', 'Official Opening', 'Offizielle Eröffnung'),
    desc: l(
      'Bienvenue · À propos de Level Up · Le programme de la journée',
      'Welcome · About Level Up · The day ahead',
      'Begrüßung · Über Level Up · Der Tag im Überblick',
    ),
  },
  {
    time: '09:00–09:45',
    title: l(
      'Le vrai Level Up : devenir la personne que les opportunités viennent chercher',
      'The real Level Up: becoming the person opportunities come looking for',
      'Das wahre Level Up: die Person werden, nach der die Chancen suchen',
    ),
    speakers: ['Ted Nguelemo'],
    lang: 'DE',
  },
  {
    time: '09:45–11:00',
    title: l(
      'Changer le récit : construire un parcours qui dépasse les chemins habituels en Allemagne',
      'Changing the narrative: building a path that goes beyond the usual routes in Germany',
      'Die Erzählung verändern: einen Weg gehen, der über die üblichen Routen in Deutschland hinausgeht',
    ),
    speakers: ['Souleymane Niang', 'Raphaël Ndongmo', 'Eric Nges'],
    moderator: 'Aisosa Erhahon-Nanna',
    lang: 'DE',
  },
  {
    time: '11:00–12:00',
    title: l(
      'Construire une entreprise en Allemagne : oser réussir, et durer',
      'Building a business in Germany: daring to succeed, and to last',
      'Ein Unternehmen in Deutschland aufbauen: Erfolg wagen – und von Dauer sein',
    ),
    speakers: ['Michel Picard', 'Arnaud Djoumbou, MBA'],
    moderator: 'Melissa ART',
  },
  pause(
    '12:00–12:30',
    l('Pause & networking', 'Break & Networking', 'Pause & Networking'),
    l('Café · Discussions · Rejoignez votre parcours', 'Coffee · Conversations · Head to your track', 'Kaffee · Gespräche · Weiter zu Ihrem Track'),
  ),
];

const tracks: { id: string; name: string; items: RawItem[] }[] = [
  {
    id: 'A',
    name: 'Career Launch',
    items: [
      {
        time: '12:30–13:30',
        title: l(
          'Planifier et construire une carrière 100K+ en période d’incertitude',
          'Planning and building a 100K+ career in uncertain times',
          'Eine 100K+-Karriere in unsicheren Zeiten planen und aufbauen',
        ),
        speakers: ['Constantin Fahom'],
      },
      {
        time: '13:30–14:30',
        title: l(
          'Diplômes, IA, compétences : construire un profil qui vous démarque',
          'Degrees, AI, skills: building a profile that sets you apart',
          'Abschlüsse, KI, Skills: ein Profil aufbauen, das Sie abhebt',
        ),
        speakers: ['Joël Tumamo', 'Dr Jean Oscar Domguia', 'Christian Mbiafeu'],
      },
      {
        time: '14:30–15:00',
        title: l(
          'Remarqué. Recruté. Promu : construire une carrière visible, crédible et faite pour évoluer',
          'Noticed. Hired. Promoted: building a career that is visible, credible and built to grow',
          'Bemerkt. Eingestellt. Befördert: eine Karriere aufbauen, die sichtbar, glaubwürdig und auf Wachstum ausgelegt ist',
        ),
        speakers: ['Ange Simo'],
      },
    ],
  },
  {
    id: 'B',
    name: 'Healthcare Excellence',
    items: [
      {
        time: '12:30–13:30',
        title: l(
          'Les clés pour réussir votre formation, lire le marché de l’emploi et saisir les opportunités',
          'The keys to succeeding in your training, reading the job market and seizing opportunities',
          'Die Schlüssel zum Erfolg in der Ausbildung, zum Verständnis des Arbeitsmarkts und zum Ergreifen von Chancen',
        ),
        speakers: ['Marina Kengne', 'Aurélien Donkeng'],
      },
      {
        time: '13:30–14:00',
        title: l(
          'Construire votre parcours vers des postes de direction dans les soins infirmiers',
          'Building your path to leadership roles in nursing',
          'Ihren Weg zu Führungspositionen in der Pflege aufbauen',
        ),
        speakers: ['Franc Fotso'],
      },
      {
        time: '14:00–15:00',
        title: l(
          'De Pflegefachkraft à Geschäftsführer : bâtir une entreprise de soins en Allemagne',
          'From Pflegefachkraft to Geschäftsführer: building a care business in Germany',
          'Von der Pflegefachkraft zum Geschäftsführer: ein Pflegeunternehmen in Deutschland aufbauen',
        ),
        speakers: ['Raphaël Ndongmo'],
      },
    ],
  },
  {
    id: 'C',
    name: 'Business Growth',
    items: [
      {
        time: '12:30–13:20',
        title: l(
          'Construire une entreprise digitale : de l’idée à une société structurée, rentable et prête à passer à l’échelle',
          'Building a digital business: from idea to a structured, profitable company built to scale',
          'Ein digitales Unternehmen aufbauen: von der Idee zu einem strukturierten, profitablen und skalierbaren Unternehmen',
        ),
        speakers: ['Lydie Fonkwe'],
      },
      {
        time: '13:20–14:10',
        title: l(
          'Comment construire un portefeuille adapté à votre profil et à votre appétit pour le risque',
          'How to build a portfolio that fits your profile and your appetite for risk',
          'So bauen Sie ein Portfolio auf, das zu Ihrem Profil und Ihrer Risikobereitschaft passt',
        ),
        speakers: ['Prof. Dr. Giles-Arnaud Nzouankeu Nana'],
      },
      {
        time: '14:10–15:00',
        title: l(
          'L’immobilier en 2026 : se constituer un patrimoine malgré des taux d’intérêt élevés',
          'Real estate in 2026: building wealth despite high interest rates',
          'Immobilien 2026: Vermögen aufbauen trotz hoher Zinsen',
        ),
        speakers: ['Franklin Ndjingue'],
      },
    ],
  },
];

const finance: RawItem[] = [
  pause(
    '15:00–16:00',
    l('Pause déjeuner & networking', 'Lunch Break & Networking', 'Mittagspause & Networking'),
    l('Restauration · Espaces partenaires · Exposants', 'Catering · Partner spaces · Exhibitors', 'Catering · Partnerbereiche · Aussteller'),
  ),
  {
    time: '16:00–16:45',
    title: l(
      '800 €, 2 000 € ou 5 000 € par mois… les leçons d’argent que personne ne vous a jamais enseignées',
      '€800, €2,000 or €5,000 a month… the money lessons nobody ever taught you',
      '800 €, 2.000 € oder 5.000 € im Monat … die Geld-Lektionen, die Ihnen nie jemand beigebracht hat',
    ),
    speakers: ['Gaël Djoukang Necdem, MBA'],
  },
  {
    time: '16:45–18:00',
    title: l('La Grande Bataille de l’investissement', 'The Great Investment Battle', 'Die große Investment-Battle'),
    desc: l(
      'Immobilier, marchés financiers ou entreprise : où se construit réellement la richesse aujourd’hui ?',
      'Real estate, financial markets or business: where is wealth actually built today?',
      'Immobilien, Finanzmärkte oder Unternehmertum: Wo wird heute wirklich Vermögen aufgebaut?',
    ),
    speakers: ['Franklin Ndjingue', 'Lydie Fonkwe', 'Prof. Dr. Giles-Arnaud Nzouankeu Nana'],
    moderator: 'Dr Constantin Fahom',
  },
  {
    time: '18:00–18:30',
    title: l('Clôture officielle', 'Official Closing', 'Offizieller Abschluss'),
    desc: l(
      'Remerciements · Mots de clôture · Édition 2027 · Photo de groupe',
      'Thank yous · Closing words · 2027 edition · Group photo',
      'Danksagungen · Schlussworte · Ausgabe 2027 · Gruppenfoto',
    ),
  },
];

const COPY: Record<
  Locale,
  { title: string; subtitle: string; headings: [string, string, string] }
> = {
  fr: {
    title: 'Level Up in Germany — 2e édition',
    subtitle: 'Samedi 17 octobre 2026 · The Squaire Conference Center · Am Flughafen 12 · 60549 Frankfurt am Main',
    headings: [
      'VISION · INSPIRATION · OPPORTUNITÉS',
      'CHAQUE INVITÉ REJOINT LE PARCOURS INCLUS DANS SON BILLET',
      'FINANCE · PATRIMOINE · LA VISION À LONG TERME',
    ],
  },
  en: {
    title: 'Level Up in Germany — 2nd Edition',
    subtitle: 'Saturday, 17 October 2026 · The Squaire Conference Center · Am Flughafen 12 · 60549 Frankfurt am Main',
    headings: [
      'VISION · INSPIRATION · OPPORTUNITIES',
      'EACH GUEST JOINS THE TRACK INCLUDED WITH THEIR TICKET',
      'FINANCE · WEALTH · THE LONG VIEW',
    ],
  },
  de: {
    title: 'Level Up in Germany — 2. Ausgabe',
    subtitle: 'Samstag, 17. Oktober 2026 · The Squaire Conference Center · Am Flughafen 12 · 60549 Frankfurt am Main',
    headings: [
      'VISION · INSPIRATION · CHANCEN',
      'JEDER GAST BESUCHT DEN TRACK, DER IN SEINEM TICKET ENTHALTEN IST',
      'FINANZEN · VERMÖGEN · DER LANGFRISTIGE BLICK',
    ],
  },
};

export function getProgramme2026(locale: Locale): {
  title: string;
  subtitle: string;
  blocks: ProgrammeBlock[];
} {
  const copy = COPY[locale];
  const localizedTracks: ProgrammeTrack[] = tracks.map((t) => ({ id: t.id, name: t.name, items: pick(t.items, locale) }));
  return {
    title: copy.title,
    subtitle: copy.subtitle,
    blocks: [
      { number: 1, heading: copy.headings[0], items: pick(opening, locale) },
      { number: 2, heading: copy.headings[1], items: [], tracks: localizedTracks },
      { number: 3, heading: copy.headings[2], items: pick(finance, locale) },
    ],
  };
}
