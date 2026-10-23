import { describe, expect, it } from 'vitest';
import type { Locale } from '@/i18n/config';
import { eventsCopy, withProgrammeFallback } from './events';
import { getProgramme2026 } from './events-2026-programme';

const locales: Locale[] = ['fr', 'en', 'de'];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + m!;
};
const range = (time: string) => time.split('–').map(toMinutes) as [number, number];

/** Les horaires d'une suite de sessions doivent s'enchaîner sans trou ni chevauchement. */
function expectContiguous(times: string[], from: string, to: string) {
  const ranges = times.map(range);
  expect(ranges[0]![0]).toBe(toMinutes(from));
  expect(ranges[ranges.length - 1]![1]).toBe(toMinutes(to));
  for (let i = 1; i < ranges.length; i++) expect(ranges[i]![0]).toBe(ranges[i - 1]![1]);
}

describe('2026 programme', () => {
  const { blocks } = getProgramme2026('en');
  const [opening, tracksBlock, finance] = blocks;

  it('has the three parts in order', () => {
    expect(blocks.map((b) => b.number)).toEqual([1, 2, 3]);
    expect(blocks.map((b) => b.heading)).toEqual([
      'VISION · INSPIRATION · OPPORTUNITIES',
      'EACH GUEST JOINS THE TRACK INCLUDED WITH THEIR TICKET',
      'FINANCE · WEALTH · THE LONG VIEW',
    ]);
  });

  it('chains the times without gaps, part by part and track by track', () => {
    expectContiguous(opening!.items.map((i) => i.time), '08:00', '12:30');
    expect(tracksBlock!.tracks!.map((t) => t.name)).toEqual(['Career Launch', 'Healthcare Excellence', 'Business Growth']);
    expect(tracksBlock!.tracks!.map((t) => t.id)).toEqual(['A', 'B', 'C']);
    for (const track of tracksBlock!.tracks!) expectContiguous(track.items.map((i) => i.time), '12:30', '15:00');
    expectContiguous(finance!.items.map((i) => i.time), '15:00', '18:30');
  });

  it('keeps every title, time and name exactly as published', () => {
    const flat = [...opening!.items, ...tracksBlock!.tracks!.flatMap((t) => t.items), ...finance!.items].map((i) => [
      i.time,
      i.title,
      i.speakers?.join(' · ') ?? '',
      i.moderator ?? '',
    ]);
    expect(flat).toEqual([
      ['08:00–08:45', 'Guest Check-In', '', ''],
      ['08:45–09:00', 'Official Opening', '', ''],
      ['09:00–09:45', 'The real Level Up: becoming the person opportunities come looking for', 'Ted Nguelemo', ''],
      [
        '09:45–11:00',
        'Changing the narrative: building a path that goes beyond the usual routes in Germany',
        'Souleymane Niang · Raphaël Ndongmo · Eric Nges',
        'Aisosa Erhahon-Nanna',
      ],
      ['11:00–12:00', 'Building a business in Germany: daring to succeed, and to last', 'Michel Picard · Arnaud Djoumbou, MBA', 'Melissa ART'],
      ['12:00–12:30', 'Break & Networking', '', ''],
      ['12:30–13:30', 'Planning and building a 100K+ career in uncertain times', 'Constantin Fahom', ''],
      ['13:30–14:30', 'Degrees, AI, skills: building a profile that sets you apart', 'Joël Tumamo · Dr Jean Oscar Domguia · Christian Mbiafeu', ''],
      ['14:30–15:00', 'Noticed. Hired. Promoted: building a career that is visible, credible and built to grow', 'Ange Simo', ''],
      ['12:30–13:30', 'The keys to succeeding in your training, reading the job market and seizing opportunities', 'Marina Kengne · Aurélien Donkeng', ''],
      ['13:30–14:00', 'Building your path to leadership roles in nursing', 'Franc Fotso', ''],
      ['14:00–15:00', 'From Pflegefachkraft to Geschäftsführer: building a care business in Germany', 'Raphaël Ndongmo', ''],
      ['12:30–13:20', 'Building a digital business: from idea to a structured, profitable company built to scale', 'Lydie Fankwe', ''],
      ['13:20–14:10', 'How to build a portfolio that fits your profile and your appetite for risk', 'Prof. Dr. Giles-Arnaud Nzouankeu Nana', ''],
      ['14:10–15:00', 'Real estate in 2026: building wealth despite high interest rates', 'Franklin Djingué', ''],
      ['15:00–16:00', 'Lunch Break & Networking', '', ''],
      ['16:00–16:45', '€800, €2,000 or €5,000 a month… the money lessons nobody ever taught you', 'Gaël Djoukang Necdem, MBA', ''],
      [
        '16:45–18:00',
        'The Great Investment Battle',
        'Franklin Djingué · Lydie Fankwe · Prof. Dr. Giles-Arnaud Nzouankeu Nana',
        'Dr Constantin Fahom',
      ],
      ['18:00–18:30', 'Official Closing', '', ''],
    ]);
  });

  it('flags only the two German sessions', () => {
    const german = [...opening!.items, ...finance!.items, ...tracksBlock!.tracks!.flatMap((t) => t.items)].filter((i) => i.lang === 'DE');
    expect(german.map((i) => i.time)).toEqual(['09:00–09:45', '09:45–11:00']);
  });

  it('is numbered (detailed layout), and identical across languages except for interface text', () => {
    expect(blocks.every((b) => b.number !== undefined)).toBe(true);
    for (const locale of locales) {
      const p = getProgramme2026(locale);
      expect(p.blocks.map((b) => b.items)).toEqual(blocks.map((b) => b.items));
      expect(p.blocks[1]!.tracks).toEqual(tracksBlock!.tracks);
      expect(p.blocks[1]!.trackNotice).toBeTruthy();
      expect(p.subtitle).toContain('The Squaire Conference Center · Am Flughafen 12 · 60549 Frankfurt am Main');
    }
  });
});

describe('withProgrammeFallback', () => {
  const fallback = eventsCopy.fr.edition2026;

  it('uses the code-level programme when the database has none', () => {
    const fromDb = { ...fallback, programmeBlocks: undefined, programmeTitle: undefined, programmeSubtitle: undefined };
    const merged = withProgrammeFallback(fromDb, fallback);
    expect(merged.programmeBlocks).toBe(fallback.programmeBlocks);
    expect(merged.programmeTitle).toBe(fallback.programmeTitle);
  });

  it('never overrides a programme entered in the database', () => {
    const fromDb = { ...fallback, programmeBlocks: [{ heading: 'Matinée', items: [{ time: '09:00', title: 'Accueil' }] }] };
    expect(withProgrammeFallback(fromDb, fallback)).toBe(fromDb);
  });
});
