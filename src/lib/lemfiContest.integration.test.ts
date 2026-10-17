import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomBytes } from 'crypto';

/**
 * Test d'intégration sur un VRAI PostgreSQL. Ignoré sauf si LEMFI_TEST_DATABASE_URL est défini.
 * Refuse toute base non locale. Exemple :
 *   LEMFI_TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/lemfi_test npx vitest run src/lib/lemfiContest.integration.test.ts
 * (le schéma doit être appliqué : DATABASE_URL=… npx prisma db push)
 */
const url = process.env.LEMFI_TEST_DATABASE_URL;
const isLocal = !!url && /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);

describe.skipIf(!url)('lemfi contest — PostgreSQL integration', () => {
  type Lib = typeof import('./lemfiContest');
  let lib: Lib;
  let prisma: typeof import('./prisma').prisma;
  let seq = 0;

  const key = () => randomBytes(18).toString('base64url');
  const proof = (seed = seq++) => {
    const data = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.from(`proof-${seed}-${randomBytes(8).toString('hex')}`)]);
    return { data, mimeType: 'image/jpeg', hash: lib.hashProof(data) };
  };
  const input = (email: string, p = proof(), submissionKey = key()) => ({
    firstName: 'Test',
    lastName: 'Participant',
    email,
    submissionKey,
    proof: p,
  });

  async function reset(next = 200) {
    await prisma.lemFiContestWinner.deleteMany();
    await prisma.lemFiContestDecision.deleteMany();
    await prisma.lemFiContestProof.deleteMany();
    await prisma.lemFiContestEntry.deleteMany();
    await prisma.lemFiContestCounter.deleteMany();
    await prisma.$executeRaw`INSERT INTO lemfi_contest_counter (id, next_number, updated_at) VALUES ('lemfi', ${next}, NOW() AT TIME ZONE 'UTC')`;
  }

  beforeAll(async () => {
    if (!isLocal) throw new Error('LEMFI_TEST_DATABASE_URL doit pointer vers une base locale (localhost).');
    process.env.DATABASE_URL = url;
    lib = await import('./lemfiContest');
    prisma = (await import('./prisma')).prisma;
  });

  afterAll(async () => {
    await prisma?.$disconnect();
  });

  it('assigns unique, contiguous numbers to 25 simultaneous registrations', async () => {
    await reset();
    const results = await Promise.all(
      Array.from({ length: 25 }, (_, i) => lib.registerEntry(input(`p${i}@example.com`))),
    );
    expect(results.every((r) => r.kind === 'created')).toBe(true);
    const numbers = results.map((r) => (r.kind === 'created' ? r.entry.sequentialNumber : -1)).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 25 }, (_, i) => 200 + i));
  });

  it('lets exactly one of several simultaneous registrations with the same e-mail win, without burning numbers', async () => {
    await reset();
    const results = await Promise.all(
      Array.from({ length: 6 }, () => lib.registerEntry(input('same@example.com'))),
    );
    expect(results.filter((r) => r.kind === 'created')).toHaveLength(1);
    expect(results.filter((r) => r.kind === 'email_taken')).toHaveLength(5);

    const next = await lib.registerEntry(input('next@example.com'));
    expect(next.kind === 'created' && next.entry.sequentialNumber).toBe(201);
  });

  it('returns the same participation when the same submission is retried', async () => {
    await reset();
    const k = key();
    const p = proof();
    const results = await Promise.all(Array.from({ length: 5 }, () => lib.registerEntry(input('retry@example.com', p, k))));
    const numbers = new Set(results.map((r) => (r.kind === 'created' || r.kind === 'existing' ? r.entry.sequentialNumber : -1)));
    expect(numbers.size).toBe(1);
    expect(results.filter((r) => r.kind === 'created')).toHaveLength(1);
    expect(await prisma.lemFiContestEntry.count()).toBe(1);
  });

  it('closes after LU350 and never reuses a number, even after a purge', async () => {
    await reset(348);
    const results = await Promise.all(
      Array.from({ length: 6 }, (_, i) => lib.registerEntry(input(`full${i}@example.com`))),
    );
    const created = results.filter((r) => r.kind === 'created');
    expect(created).toHaveLength(3);
    expect(results.filter((r) => r.kind === 'full')).toHaveLength(3);
    expect(
      created.map((r) => (r.kind === 'created' ? r.entry.sequentialNumber : 0)).sort((a, b) => a - b),
    ).toEqual([348, 349, 350]);
    expect(await lib.isContestFull()).toBe(true);

    await prisma.lemFiContestEntry.deleteMany();
    expect((await lib.registerEntry(input('late@example.com'))).kind).toBe('full');
  });

  it('flags an identical proof for review instead of rejecting it', async () => {
    await reset();
    const p = proof();
    const a = await lib.registerEntry(input('a@example.com', p));
    const b = await lib.registerEntry(input('b@example.com', p));
    expect(a.kind).toBe('created');
    expect(b.kind).toBe('created');
    const list = await lib.listEntriesForAdmin({ limit: 10, offset: 0 });
    const flagged = list.entries.find((e) => e.email === 'b@example.com')!;
    expect(flagged.duplicateOfNumber).toBe(200);
    expect(flagged.sameProofCount).toBe(2);
  });

  it('records decisions with history, keeps the LU number, and requires a reason to reject', async () => {
    await reset();
    const r = await lib.registerEntry(input('dec@example.com'));
    if (r.kind !== 'created') throw new Error('expected created');
    const id = r.entry.id;

    expect(await lib.decideEntry(id, 'rejected', '  ')).toEqual({ ok: false, code: 'reason_required' });
    expect(await lib.decideEntry(id, 'rejected', 'Capture illisible')).toEqual({ ok: true });
    expect(await lib.decideEntry(id, 'rejected', 'Capture illisible')).toEqual({ ok: false, code: 'unchanged' });
    expect(await lib.decideEntry(id, 'validated', null)).toEqual({ ok: true });

    const d = await lib.getEntryDetailForAdmin(id);
    expect(d?.status).toBe('validated');
    expect(d?.sequentialNumber).toBe(200);
    expect(d?.decisions.map((x) => `${x.fromStatus}>${x.toStatus}`)).toEqual(['rejected>validated', 'pending>rejected']);
  });

  it('lists newest first and searches by name, e-mail and LU number', async () => {
    await reset();
    await lib.registerEntry({ ...input('alice@example.com'), firstName: 'Alice', lastName: 'Martin' });
    await new Promise((res) => setTimeout(res, 15));
    await lib.registerEntry({ ...input('bob@example.com'), firstName: 'Bob', lastName: 'Durand' });

    const all = await lib.listEntriesForAdmin({ limit: 10, offset: 0 });
    expect(all.entries.map((e) => e.sequentialNumber)).toEqual([201, 200]);
    expect((await lib.listEntriesForAdmin({ q: 'martin', limit: 10, offset: 0 })).entries.map((e) => e.sequentialNumber)).toEqual([200]);
    expect((await lib.listEntriesForAdmin({ q: 'BOB@EXAMPLE', limit: 10, offset: 0 })).entries.map((e) => e.sequentialNumber)).toEqual([201]);
    expect((await lib.listEntriesForAdmin({ q: 'LU201', limit: 10, offset: 0 })).entries.map((e) => e.email)).toEqual(['bob@example.com']);
    expect((await lib.listEntriesForAdmin({ status: 'validated', limit: 10, offset: 0 })).total).toBe(0);
  });

  it('purges expired entries with their proofs and history', async () => {
    await reset();
    const r = await lib.registerEntry(input('old@example.com'));
    if (r.kind !== 'created') throw new Error('expected created');
    await prisma.$executeRaw`UPDATE lemfi_contest_entries SET created_at = (NOW() AT TIME ZONE 'UTC') - INTERVAL '200 days' WHERE id = ${r.entry.id}`;
    await lib.registerEntry(input('recent@example.com'));

    expect(await lib.countExpiredEntries(90)).toBe(1);
    expect(await lib.purgeExpiredEntries(90)).toBe(1);
    expect(await prisma.lemFiContestEntry.count()).toBe(1);
    expect(await prisma.lemFiContestProof.count()).toBe(1);
  });

  describe('prize draw', () => {
    type Draw = typeof import('./lemfiContestDraw');
    let draw: Draw;

    async function seed(validated: number, pending = 0) {
      await reset();
      const ids: string[] = [];
      for (let i = 0; i < validated + pending; i++) {
        const r = await lib.registerEntry(input(`d${i}@example.com`));
        if (r.kind !== 'created') throw new Error('expected created');
        if (i < validated) await lib.decideEntry(r.entry.id, 'validated', null);
        ids.push(r.entry.id);
      }
      return ids;
    }

    beforeAll(async () => {
      draw = await import('./lemfiContestDraw');
    });

    it('only draws validated participants, each at most once', async () => {
      await seed(5, 3);
      const first = await draw.drawWinners('Tablette', 3);
      const second = await draw.drawWinners('AirPods', 3);
      if (!first.ok || !second.ok) throw new Error('expected ok');
      expect(first.winners).toHaveLength(3);
      expect(second.winners).toHaveLength(2);
      const all = [...first.winners, ...second.winners];
      expect(new Set(all.map((w) => w.entry.id)).size).toBe(5);
      expect(all.every((w) => w.entry.status === 'validated')).toBe(true);
      expect(await draw.drawWinners('Surprise', 1)).toEqual({ ok: false, code: 'no_eligible' });
    });

    it('never gives the same participant two prizes under simultaneous draws', async () => {
      await seed(10);
      const results = await Promise.all(Array.from({ length: 6 }, () => draw.drawWinners('T-shirt', 2)));
      const winners = results.flatMap((r) => (r.ok ? r.winners : []));
      expect(new Set(winners.map((w) => w.entry.id)).size).toBe(winners.length);
      expect(winners.length).toBeLessThanOrEqual(10);
      expect(await prisma.lemFiContestWinner.count()).toBe(winners.length);
    });

    it('rejects invalid input', async () => {
      await seed(1);
      expect(await draw.drawWinners('  ', 1)).toEqual({ ok: false, code: 'invalid_prize' });
      expect(await draw.drawWinners('Lot', 0)).toEqual({ ok: false, code: 'invalid_count' });
      expect(await draw.drawWinners('Lot', 1.5)).toEqual({ ok: false, code: 'invalid_count' });
      expect(await draw.drawWinners('Lot', 9999)).toEqual({ ok: false, code: 'invalid_count' });
    });

    it('lets a winner forfeit, keeps them out of later draws, and shows prizes in the admin views', async () => {
      const ids = await seed(2);
      const first = await draw.drawWinners('Tablette', 1);
      if (!first.ok) throw new Error('expected ok');
      const w = first.winners[0]!;

      expect(await draw.forfeitWinner(w.id)).toEqual({ ok: true, prize: 'Tablette' });
      expect(await draw.forfeitWinner(w.id)).toEqual({ ok: false, code: 'unchanged' });
      expect(await draw.forfeitWinner('00000000-0000-0000-0000-000000000000')).toEqual({ ok: false, code: 'not_found' });

      const state = await draw.getDrawState();
      expect(state.eligible).toBe(1);
      const replacement = await draw.drawWinners('Tablette', 1);
      if (!replacement.ok) throw new Error('expected ok');
      expect(replacement.winners[0]!.entry.id).not.toBe(w.entry.id);
      expect(await draw.drawWinners('Tablette', 1)).toEqual({ ok: false, code: 'no_eligible' });

      const detail = await lib.getEntryDetailForAdmin(ids.find((id) => id === w.entry.id)!);
      expect(detail?.winner).toEqual({ prize: 'Tablette', status: 'forfeited' });
      const list = await lib.listEntriesForAdmin({ limit: 10, offset: 0 });
      expect(list.entries.filter((e) => e.winner?.status === 'won')).toHaveLength(1);
    });
  });
});
