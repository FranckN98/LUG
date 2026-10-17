import { randomInt } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import { LEMFI_MAX_DRAW_COUNT } from '@/config/lemfiContest';
import { cleanPrizeName, pickRandom } from './lemfiContestUtils';

const WINNER_SELECT = {
  id: true,
  prize: true,
  status: true,
  drawnAt: true,
  forfeitedAt: true,
  entry: {
    select: { id: true, sequentialNumber: true, firstName: true, lastName: true, email: true, status: true },
  },
} satisfies Prisma.LemFiContestWinnerSelect;

export type AdminWinner = Prisma.LemFiContestWinnerGetPayload<{ select: typeof WINNER_SELECT }>;

/** Éligible = validé et jamais tiré (un gagnant absent ne revient pas dans le tirage). */
const ELIGIBLE: Prisma.LemFiContestEntryWhereInput = { status: 'validated', winner: { is: null } };

export async function getDrawState(): Promise<{ eligible: number; winners: AdminWinner[] }> {
  const [eligible, winners] = await Promise.all([
    prisma.lemFiContestEntry.count({ where: ELIGIBLE }),
    prisma.lemFiContestWinner.findMany({ orderBy: { drawnAt: 'asc' }, select: WINNER_SELECT }),
  ]);
  return { eligible, winners };
}

export type DrawResult =
  | { ok: true; winners: AdminWinner[]; requested: number }
  | { ok: false; code: 'invalid_prize' | 'invalid_count' | 'no_eligible' };

/** Tire `count` gagnants parmi les participants validés, avec un aléa cryptographique. */
export async function drawWinners(prizeRaw: unknown, count: unknown): Promise<DrawResult> {
  const prize = cleanPrizeName(prizeRaw);
  if (!prize) return { ok: false, code: 'invalid_prize' };
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > LEMFI_MAX_DRAW_COUNT) {
    return { ok: false, code: 'invalid_count' };
  }

  // Deux tirages simultanés peuvent choisir la même personne : l'unicité de entryId en refuse un,
  // sa transaction est annulée et on retire dans le reste du lot.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await prisma.$transaction(async (tx): Promise<DrawResult> => {
        const pool = await tx.lemFiContestEntry.findMany({
          where: ELIGIBLE,
          select: { id: true },
          orderBy: { sequentialNumber: 'asc' },
        });
        if (pool.length === 0) return { ok: false, code: 'no_eligible' };

        const picked = pickRandom(pool, count, (max) => randomInt(max));
        const winners: AdminWinner[] = [];
        for (const { id } of picked) {
          winners.push(await tx.lemFiContestWinner.create({ data: { entryId: id, prize }, select: WINNER_SELECT }));
        }
        return { ok: true, winners, requested: count };
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue;
      throw e;
    }
  }
  throw new Error('Tirage concurrent : réessayez.');
}

export type ForfeitResult = { ok: true; prize: string } | { ok: false; code: 'not_found' | 'unchanged' };

/** Le gagnant est absent ou renonce : le lot redevient à tirer, la personne ne peut plus être retirée. */
export async function forfeitWinner(id: string): Promise<ForfeitResult> {
  const res = await prisma.lemFiContestWinner.updateMany({
    where: { id, status: 'won' },
    data: { status: 'forfeited', forfeitedAt: new Date() },
  });
  const winner = await prisma.lemFiContestWinner.findUnique({ where: { id }, select: { prize: true } });
  if (!winner) return { ok: false, code: 'not_found' };
  return res.count === 0 ? { ok: false, code: 'unchanged' } : { ok: true, prize: winner.prize };
}
