import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FeedbackInput } from './feedbackUtils';

/**
 * Test d'intégration sur un VRAI PostgreSQL local. Ignoré sauf si FEEDBACK_TEST_DATABASE_URL est défini.
 *   FEEDBACK_TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/test npx vitest run src/lib/feedback.integration.test.ts
 * (schéma appliqué avec `npx prisma db push`)
 */
const url = process.env.FEEDBACK_TEST_DATABASE_URL;
const isLocal = !!url && /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);

describe.skipIf(!url)('feedback — PostgreSQL integration', () => {
  let lib: typeof import('./feedback');
  let utils: typeof import('./feedbackUtils');
  let prisma: typeof import('./prisma').prisma;

  const answer = (extra: Partial<FeedbackInput> = {}): FeedbackInput => ({
    rating: 4,
    highlights: null,
    likesAndImprovements: null,
    wantedSpeakers: null,
    wantedTopics: null,
    isSigned: false,
    firstName: null,
    lastName: null,
    news: null,
    ...extra,
  });

  async function reset() {
    await prisma.feedbackResponse.deleteMany();
    await prisma.feedbackTag.deleteMany();
    await prisma.feedbackNewsSignup.deleteMany();
  }

  beforeAll(async () => {
    if (!isLocal) throw new Error('FEEDBACK_TEST_DATABASE_URL doit pointer vers une base locale (localhost).');
    process.env.DATABASE_URL = url;
    lib = await import('./feedback');
    utils = await import('./feedbackUtils');
    prisma = (await import('./prisma')).prisma;
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  it('saves an anonymous answer without any identifier or exact time', async () => {
    await reset();
    expect(await lib.submitFeedback(answer({ highlights: 'Très bien' }))).toEqual({ newsletter: 'none' });
    const [row] = await prisma.feedbackResponse.findMany();
    expect(row).toMatchObject({ rating: 4, highlights: 'Très bien', isSigned: false, firstName: null, lastName: null });

    const cols = async (table: string) =>
      (
        await prisma.$queryRaw<{ column_name: string }[]>`
          SELECT column_name FROM information_schema.columns WHERE table_name = ${table} ORDER BY column_name`
      ).map((c) => c.column_name);
    expect(await cols('feedback_responses')).toEqual(
      [
        'first_name', 'highlights', 'id', 'is_signed', 'last_name', 'likes_and_improvements',
        'rating', 'submitted_on', 'wanted_speakers', 'wanted_topics',
      ].sort(),
    );
    expect(await cols('feedback_news_signups')).toEqual(['email', 'first_name', 'id', 'last_name']);

    const [day] = await prisma.$queryRaw<{ submitted_on: Date; day: string }[]>`
      SELECT submitted_on, submitted_on::text AS day FROM feedback_responses`;
    expect(day!.submitted_on.getUTCHours()).toBe(0);
    expect(day!.day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('stores the newsletter signup separately, only when asked, and merges repeats', async () => {
    await reset();
    expect(await lib.submitFeedback(answer())).toEqual({ newsletter: 'none' });
    expect(await prisma.feedbackNewsSignup.count()).toBe(0);

    const news = { email: 'awa@example.com', firstName: 'Awa', lastName: null };
    expect(await lib.submitFeedback(answer({ news }))).toEqual({ newsletter: 'saved' });
    expect(await lib.submitFeedback(answer({ news: { ...news, firstName: null, lastName: 'Diallo' } }))).toEqual({ newsletter: 'saved' });

    const signups = await lib.listNewsSignups();
    expect(signups).toHaveLength(1);
    expect(signups[0]).toMatchObject({ email: 'awa@example.com', firstName: 'Awa', lastName: 'Diallo' });
    expect(await prisma.feedbackResponse.count()).toBe(3);
    expect(JSON.stringify(await prisma.feedbackResponse.findMany())).not.toContain('awa@example.com');
  });

  it('lists, filters, searches and tags responses', async () => {
    await reset();
    await lib.submitFeedback(answer({ rating: 5, highlights: 'Le networking était excellent' }));
    await lib.submitFeedback(answer({ rating: 2, likesAndImprovements: 'Trop court, la restauration a manqué', isSigned: true, firstName: 'Awa', lastName: 'Diallo' }));
    await lib.submitFeedback(answer({ rating: 5, wantedSpeakers: 'Un entrepreneur local' }));
    await lib.submitFeedback(answer({ rating: 3 }));

    const all = await lib.listFeedback({}, { limit: 10, offset: 0 });
    expect(all.total).toBe(4);
    expect(all.stats.distribution).toEqual([0, 1, 1, 0, 2]);
    expect(all.stats.average).toBeCloseTo(3.75);
    expect((await lib.listFeedback({ rating: 5 }, { limit: 10, offset: 0 })).total).toBe(2);
    expect((await lib.listFeedback({ signed: 'signed' }, { limit: 10, offset: 0 })).total).toBe(1);
    expect((await lib.listFeedback({ signed: 'anonymous' }, { limit: 10, offset: 0 })).total).toBe(3);
    expect((await lib.listFeedback({ q: 'RESTAURATION' }, { limit: 10, offset: 0 })).total).toBe(1);
    expect((await lib.listFeedback({ q: 'diallo' }, { limit: 10, offset: 0 })).total).toBe(1);
    expect((await lib.listFeedback({ q: 'entrepreneur local' }, { limit: 10, offset: 0 })).total).toBe(1);

    const today = utils.berlinDay().toISOString().slice(0, 10);
    expect((await lib.listFeedback({ from: today, to: today }, { limit: 10, offset: 0 })).total).toBe(4);
    expect((await lib.listFeedback({ from: '2099-01-01' }, { limit: 10, offset: 0 })).total).toBe(0);
    expect((await lib.listFeedback({}, { limit: 3, offset: 3 })).responses).toHaveLength(1);

    const tags = await lib.listTags();
    expect(tags.map((t) => t.name)).toContain('Restauration');
    const resto = tags.find((t) => t.name === 'Restauration')!;
    const target = (await lib.listFeedback({ q: 'restauration' }, { limit: 10, offset: 0 })).responses[0]!;
    const tagged = await lib.setResponseTags(target.id, [resto.id, 'unknown-id']);
    expect(tagged?.tags.map((t) => t.name)).toEqual(['Restauration']);
    expect((await lib.listFeedback({ tagId: resto.id }, { limit: 10, offset: 0 })).total).toBe(1);
    expect(await lib.setResponseTags('00000000-0000-0000-0000-000000000000', [])).toBeNull();

    expect(await lib.renameTag(resto.id, 'Repas')).toMatchObject({ ok: true, name: 'Repas' });
    expect(await lib.createTag('repas')).toEqual({ ok: false, code: 'duplicate' });
    expect(await lib.createTag('   ')).toEqual({ ok: false, code: 'invalid' });
    expect(await lib.createTag('Accueil')).toMatchObject({ ok: true });
    expect(await lib.deleteTag(resto.id)).toBe(true);
    expect((await lib.listFeedback({ q: 'restauration' }, { limit: 10, offset: 0 })).responses[0]!.tags).toEqual([]);
    expect(await lib.deleteTag(resto.id)).toBe(false);
  });
});
