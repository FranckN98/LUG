/**
 * Données détaillées Mega Conférence 2025 — Frankfurt, 4 oct. 2025 (1re édition).
 * Basé sur les supports officiels (programme, flyers, OCR).
 */
import { SITE_CONTACT } from '@/config/siteContact';
export type ProgrammeItem = { time: string; title: string; desc?: string };
export type SpeakerRow = { name: string; role: string; domain: string };
export type ProgrammeBlock = { heading: string; items: ProgrammeItem[] };

/**
 * Fallback si le dossier public/events/2025 est vide ou illisible au build.
 * En pratique la page Events lit le disque (getPublicEventGallery) — placez vos JPG/PNG ici.
 */
export const EVENT_2025_GALLERY_PATHS = [] as const;

/** Fallback 2026 si le dossier est vide (ex. lug-01.jpeg) */
export const EVENT_2026_GALLERY_PATHS = ['/events/2026/lug-01.jpeg'] as const;

const partners2025 = [
  'AAD Institut',
  'Geek Institut',
  'AfroGeek',
  'GrowInDE',
  'SB Salon',
  'Delycious',
  'Dream Village',
  'CEF ImmoFinanz',
  'SESANA',
  'Believe Real Estate Formation',
];

export const detail2025Fr = {
  theme: 'Des racines ailleurs, des ailes ici',
  tagline: 'Mega Conférence · 1re édition · Frankfurt',
  timeRange: '09h00 – 18h00',
  audience: 'Étudiants / Azubi · Travailleurs · Nouveaux arrivants',
  highlights: [
    {
      title: 'Finger food & cocktails',
      body: 'Un moment convivial pour échanger autour de petites gourmandises.',
    },
    {
      title: 'Ateliers pratiques',
      body: 'CV, entretiens, projets : mise en situation et entraide.',
    },
    {
      title: 'Shooting photo pro',
      body: 'Des portraits pour vos profils et candidatures.',
    },
  ],
  programmeBlocks: [
    {
      heading: 'Accueil',
      items: [
        { time: '09:00', title: 'Accueil & enregistrement des participants' },
        { time: '09:30', title: "Discours d'ouverture des organisateurs" },
      ],
    },
    {
      heading: 'Intégration et vie sociale',
      items: [
        {
          time: '10:00',
          title: 'M. Ted Nguelemo',
          desc: 'Selbstbewusst in Deutschland — oser parler clair et avancer dans sa carrière.',
        },
        {
          time: '10:30',
          title: 'M. Contimi Kenfack',
          desc: "Agir ici, impacter là-bas : l'engagement social de la diaspora au service de l'Afrique.",
        },
        {
          time: '11:00',
          title: 'Panel — C. Kenmognie, D. Ngoko, T. Nguelemo',
          desc: 'Défis et force intérieure : discrimination, confiance et équilibre.',
        },
        { time: '12:00', title: 'Pause — déjeuner, café, pitch partenaires' },
      ],
    },
    {
      heading: 'Carrière, business, finances & investissements',
      items: [
        {
          time: '12:15',
          title: 'M. Cedric Folepe',
          desc: 'De la formation aux premiers salaires : mieux gérer ses finances.',
        },
        {
          time: '12:45',
          title: 'M. Patrick Meppe',
          desc: "Se positionner sur le marché de l'emploi allemand en 2025.",
        },
        {
          time: '13:15',
          title: 'Mme Stephy Makole',
          desc: "De l'informel à l'officiel : transition vers un business rentable.",
        },
        {
          time: '13:45',
          title: 'Panel — C. Folepe, C. Kenmognie, P. Meppe',
          desc: 'Négocier son salaire : le bon background.',
        },
        {
          time: '14:30',
          title: 'Panel — C. Folepe, S. Makole, D. Tekoudjou',
          desc: 'La course à la liberté financière.',
        },
        { time: '15:30', title: 'Grande pause — finger food, cocktails, networking' },
      ],
    },
    {
      heading: "Stratégies d'études & insertion professionnelle",
      items: [
        {
          time: '16:15',
          title: 'Panel — C. Tsague, E. Le Snieper, A. Donkeng, T. Ngoko',
          desc: 'Frustrations et réalités : la vie étudiante en Allemagne.',
        },
        {
          time: '17:00',
          title: 'Panel — C. Mbiafeu, F. Ngami, M. Mael Talla, J. Tumamo',
          desc: 'Réussir ses études et accélérer son entrée sur le marché du travail.',
        },
        { time: '17:45', title: 'Mot de clôture — équipe Level Up Diaspo' },
      ],
    },
  ] satisfies ProgrammeBlock[],
  speakers: [
    { name: 'Elysée Le Snieper', role: 'Ing.', domain: 'Informatique' },
    { name: 'Carly Tsague', role: 'Étudiante en médecine', domain: 'Entrepreneuriat' },
    { name: 'Tume Ngoko', role: 'Ingénieur', domain: 'Création de contenu' },
    { name: 'Aurelien Donkeng', role: 'Pflegemanager', domain: 'Entrepreneur' },
    {
      name: 'Donald Donchi',
      role: 'Consultant IT',
      domain: 'Geek Institut · Président AfroGeek e.V.',
    },
    { name: 'Cedric Folepe', role: 'Conseiller certifié', domain: 'Finance & immobilier · CEF ImmoFinanz' },
    { name: 'Stephy Makole', role: 'CEO SB Salon', domain: 'Master logistique · Entrepreneure' },
    { name: 'Daniel Nguenevit', role: 'Ingénieur biotech médical', domain: 'CEO AAD-Institut' },
    {
      name: 'Contimi Kenfack',
      role: 'Fondateur 3 E’s 4 Africa',
      domain: 'Student of the Year 2024, Allemagne',
    },
    { name: 'Calixte Kenmognie', role: 'Coach', domain: 'Développement personnel · Immobilier' },
    { name: 'Patrick Meppe', role: 'Entrepreneur tech', domain: 'Développement web · CEF TAPMEPPE WORK' },
    { name: 'Ted Nguelemo', role: 'Software Engineer', domain: 'Tesla Automation GmbH' },
    { name: 'Djonic Ngoko', role: 'Bauüberwacher DB', domain: 'Artiste' },
    { name: 'Christian Mbiafeu', role: 'Senior Quality Engineer', domain: 'STERIS Corporation' },
    { name: 'Meris Mael Talla', role: 'Werkstudentin', domain: 'CEO Ateliers bento cakes' },
    { name: 'Franck Ngami', role: 'Coordonnateur solutions cloud', domain: 'Co-fondateur Level Up in Germany' },
    { name: 'Joel Tumamo', role: 'Software Engineer', domain: '' },
  ] satisfies SpeakerRow[],
  partners: partners2025,
  contact: {
    email: SITE_CONTACT.email,
    phone: SITE_CONTACT.phoneDisplay,
    instagram: 'Level up in Germany',
  },
};

export const detail2025De = {
  ...detail2025Fr,
  theme: 'Wurzeln anderswo, Flügel hier',
  tagline: 'Mega-Konferenz · 1. Ausgabe · Frankfurt',
  audience: 'Studierende / Azubis · Berufstätige · Neuankömmlinge',
  highlights: [
    {
      title: 'Fingerfood & Cocktails',
      body: 'Austausch in entspannter Atmosphäre.',
    },
    {
      title: 'Praxis-Workshops',
      body: 'Lebenslauf, Bewerbungsgespräche, Projekte — gemeinsam üben.',
    },
    {
      title: 'Professionelles Fotoshooting',
      body: 'Portraits für Profile und Bewerbungen.',
    },
  ],
  programmeBlocks: [
    {
      heading: 'Begrüßung',
      items: [
        { time: '09:00', title: 'Empfang & Check-in' },
        { time: '09:30', title: 'Eröffnungsrede der Organisatoren' },
      ],
    },
    {
      heading: 'Integration & soziales Leben',
      items: [
        {
          time: '10:00',
          title: 'Ted Nguelemo',
          desc: 'Selbstbewusst in Deutschland — klar sprechen und den nächsten Karriereschritt gehen.',
        },
        {
          time: '10:30',
          title: 'Contimi Kenfack',
          desc: 'Hier handeln, dort wirken: gesellschaftliches Engagement der Diaspora für Afrika.',
        },
        {
          time: '11:00',
          title: 'Panel — Kenmognie, Ngoko, Nguelemo',
          desc: 'Herausforderungen & innere Stärke: Diskriminierung, Vertrauen, Balance.',
        },
        { time: '12:00', title: 'Pause — Mittagessen, Kaffee, Partner-Pitch' },
      ],
    },
    {
      heading: 'Karriere, Business, Finanzen & Investitionen',
      items: [
        {
          time: '12:15',
          title: 'Cedric Folepe',
          desc: 'Von der Ausbildung zum ersten Gehalt: Finanzen besser managen.',
        },
        {
          time: '12:45',
          title: 'Patrick Meppe',
          desc: 'Positionierung auf dem deutschen Arbeitsmarkt 2025.',
        },
        {
          time: '13:15',
          title: 'Stephy Makole',
          desc: 'Vom Informellen zum Offiziellen: Übergang in ein tragfähiges Business.',
        },
        {
          time: '13:45',
          title: 'Panel — Folepe, Kenmognie, Meppe',
          desc: 'Gehalt verhandeln: das nötige Background-Wissen.',
        },
        {
          time: '14:30',
          title: 'Panel — Folepe, Makole, Tekoudjou',
          desc: 'Der Weg zur finanziellen Freiheit.',
        },
        { time: '15:30', title: 'Längere Pause — Networking, Fingerfood' },
      ],
    },
    {
      heading: 'Studium & Berufseinstieg',
      items: [
        {
          time: '16:15',
          title: 'Panel — Tsague, Le Snieper, Donkeng, Ngoko',
          desc: 'Frustrationen & Realität: Studienleben in Deutschland.',
        },
        {
          time: '17:00',
          title: 'Panel — Mbiafeu, Ngami, Mael Talla, Tumamo',
          desc: 'Studium meistern und den Berufseinstieg beschleunigen.',
        },
        { time: '17:45', title: 'Abschlusswort — Team Level Up Diaspo' },
      ],
    },
  ] satisfies ProgrammeBlock[],
};

export const detail2025En = {
  ...detail2025Fr,
  theme: 'Roots elsewhere, wings here',
  tagline: 'Mega Conference · 1st edition · Frankfurt',
  audience: 'Students / apprentices · Workers · Newcomers',
  highlights: [
    {
      title: 'Finger food & cocktails',
      body: 'A warm moment to connect over light bites.',
    },
    {
      title: 'Hands-on workshops',
      body: 'CV, interviews, projects — practice together.',
    },
    {
      title: 'Professional photo shoot',
      body: 'Portraits for your profiles and applications.',
    },
  ],
  programmeBlocks: [
    {
      heading: 'Welcome',
      items: [
        { time: '09:00', title: 'Registration & welcome' },
        { time: '09:30', title: 'Opening remarks from the organisers' },
      ],
    },
    {
      heading: 'Integration & social life',
      items: [
        {
          time: '10:00',
          title: 'Ted Nguelemo',
          desc: 'Confident in Germany — speaking clearly and moving your career forward.',
        },
        {
          time: '10:30',
          title: 'Contimi Kenfack',
          desc: 'Acting here, impacting there: diaspora social engagement for Africa.',
        },
        {
          time: '11:00',
          title: 'Panel — Kenmognie, Ngoko, Nguelemo',
          desc: 'Challenges & inner strength: discrimination, confidence, balance.',
        },
        { time: '12:00', title: 'Break — lunch, coffee, partner pitch' },
      ],
    },
    {
      heading: 'Career, business, finance & investing',
      items: [
        {
          time: '12:15',
          title: 'Cedric Folepe',
          desc: 'From training to first salary: managing your money better.',
        },
        {
          time: '12:45',
          title: 'Patrick Meppe',
          desc: 'Positioning yourself on the German job market in 2025.',
        },
        {
          time: '13:15',
          title: 'Stephy Makole',
          desc: 'From informal to official: building a profitable business.',
        },
        {
          time: '13:45',
          title: 'Panel — Folepe, Kenmognie, Meppe',
          desc: 'Negotiating your salary: the background you need.',
        },
        {
          time: '14:30',
          title: 'Panel — Folepe, Makole, Tekoudjou',
          desc: 'The path to financial freedom.',
        },
        { time: '15:30', title: 'Long break — finger food, cocktails, networking' },
      ],
    },
    {
      heading: 'Study strategies & professional integration',
      items: [
        {
          time: '16:15',
          title: 'Panel — Tsague, Le Snieper, Donkeng, Ngoko',
          desc: 'Frustrations and realities: student life in Germany.',
        },
        {
          time: '17:00',
          title: 'Panel — Mbiafeu, Ngami, Mael Talla, Tumamo',
          desc: 'Succeeding in studies and accelerating entry into the job market.',
        },
        { time: '17:45', title: 'Closing words — Level Up Diaspo team' },
      ],
    },
  ] satisfies ProgrammeBlock[],
};
