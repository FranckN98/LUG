import type { Locale } from '@/i18n/config';
import type { ProgrammeBlock, ProgrammeItem } from '@/content/events-2025-detail';

/**
 * Programme officiel de Level Up in Germany — 2e édition, samedi 17 octobre 2026.
 * Horaires, titres et noms sont repris tels que publiés : ne pas les traduire ni les reformuler.
 * Seuls les libellés d'interface (consigne billet, date) changent selon la langue.
 */

const check = (time: string, title: string, desc: string): ProgrammeItem => ({ time, title, desc, kind: 'break' });

const opening: ProgrammeBlock['items'] = [
  check('08:00–08:45', 'Guest Check-In', 'Registration · Welcome coffee · Networking'),
  { time: '08:45–09:00', title: 'Official Opening', desc: 'Welcome · About Level Up · The day ahead' },
  {
    time: '09:00–09:45',
    title: 'The real Level Up: becoming the person opportunities come looking for',
    speakers: ['Ted Nguelemo'],
    lang: 'DE',
  },
  {
    time: '09:45–11:00',
    title: 'Changing the narrative: building a path that goes beyond the usual routes in Germany',
    speakers: ['Souleymane Niang', 'Raphaël Ndongmo', 'Eric Nges'],
    moderator: 'Aisosa Erhahon-Nanna',
    lang: 'DE',
  },
  {
    time: '11:00–12:00',
    title: 'Building a business in Germany: daring to succeed, and to last',
    speakers: ['Michel Picard', 'Arnaud Djoumbou, MBA'],
    moderator: 'Melissa ART',
  },
  check('12:00–12:30', 'Break & Networking', 'Coffee · Conversations · Head to your track'),
];

const tracks: NonNullable<ProgrammeBlock['tracks']> = [
  {
    id: 'A',
    name: 'Career Launch',
    items: [
      { time: '12:30–13:30', title: 'Planning and building a 100K+ career in uncertain times', speakers: ['Constantin Fahom'] },
      {
        time: '13:30–14:30',
        title: 'Degrees, AI, skills: building a profile that sets you apart',
        speakers: ['Joël Tumamo', 'Dr Jean Oscar Domguia', 'Christian Mbiafeu'],
      },
      {
        time: '14:30–15:00',
        title: 'Noticed. Hired. Promoted: building a career that is visible, credible and built to grow',
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
        title: 'The keys to succeeding in your training, reading the job market and seizing opportunities',
        speakers: ['Marina Kengne', 'Aurélien Donkeng'],
      },
      { time: '13:30–14:00', title: 'Building your path to leadership roles in nursing', speakers: ['Franc Fotso'] },
      {
        time: '14:00–15:00',
        title: 'From Pflegefachkraft to Geschäftsführer: building a care business in Germany',
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
        title: 'Building a digital business: from idea to a structured, profitable company built to scale',
        speakers: ['Lydie Fankwe'],
      },
      {
        time: '13:20–14:10',
        title: 'How to build a portfolio that fits your profile and your appetite for risk',
        speakers: ['Prof. Dr. Giles-Arnaud Nzouankeu Nana'],
      },
      {
        time: '14:10–15:00',
        title: 'Real estate in 2026: building wealth despite high interest rates',
        speakers: ['Franklin Djingué'],
      },
    ],
  },
];

const finance: ProgrammeBlock['items'] = [
  check('15:00–16:00', 'Lunch Break & Networking', 'Catering · Partner spaces · Exhibitors'),
  {
    time: '16:00–16:45',
    title: '€800, €2,000 or €5,000 a month… the money lessons nobody ever taught you',
    speakers: ['Gaël Djoukang Necdem, MBA'],
  },
  {
    time: '16:45–18:00',
    title: 'The Great Investment Battle',
    desc: 'Real estate, financial markets or business: where is wealth actually built today?',
    speakers: ['Franklin Djingué', 'Lydie Fankwe', 'Prof. Dr. Giles-Arnaud Nzouankeu Nana'],
    moderator: 'Dr Constantin Fahom',
  },
  { time: '18:00–18:30', title: 'Official Closing', desc: 'Thank yous · Closing words · 2027 edition · Group photo' },
];

const COPY: Record<Locale, { title: string; subtitle: string; ticketNotice: string }> = {
  fr: {
    title: 'Level Up in Germany — 2e édition',
    subtitle: 'Samedi 17 octobre 2026 · The Squaire Conference Center · Am Flughafen 12 · 60549 Frankfurt am Main',
    ticketNotice: 'Chaque participant rejoint le parcours correspondant à son billet.',
  },
  en: {
    title: 'Level Up in Germany — 2nd Edition',
    subtitle: 'Saturday, 17 October 2026 · The Squaire Conference Center · Am Flughafen 12 · 60549 Frankfurt am Main',
    ticketNotice: 'Each guest joins the track that matches their ticket.',
  },
  de: {
    title: 'Level Up in Germany — 2. Ausgabe',
    subtitle: 'Samstag, 17. Oktober 2026 · The Squaire Conference Center · Am Flughafen 12 · 60549 Frankfurt am Main',
    ticketNotice: 'Jeder Gast besucht den Track, der zu seinem Ticket gehört.',
  },
};

export function getProgramme2026(locale: Locale): {
  title: string;
  subtitle: string;
  blocks: ProgrammeBlock[];
} {
  const copy = COPY[locale];
  return {
    title: copy.title,
    subtitle: copy.subtitle,
    blocks: [
      { number: 1, heading: 'VISION · INSPIRATION · OPPORTUNITIES', items: opening },
      {
        number: 2,
        heading: 'EACH GUEST JOINS THE TRACK INCLUDED WITH THEIR TICKET',
        items: [],
        tracks,
        trackNotice: copy.ticketNotice,
      },
      { number: 3, heading: 'FINANCE · WEALTH · THE LONG VIEW', items: finance },
    ],
  };
}
