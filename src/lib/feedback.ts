import { randomInt } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import {
  berlinDay,
  cleanTagName,
  DEFAULT_FEEDBACK_TAGS,
  formatCode,
  generateCode,
  hashCode,
  type FeedbackFilters,
  type FeedbackInput,
} from './feedbackUtils';

// ── Envoi d'une réponse ─────────────────────────────────────────────────────

class CodeRejected extends Error {}

export type SubmitResult =
  | { kind: 'ok'; newsletter: 'none' | 'saved' | 'failed' }
  | { kind: 'code_invalid' }
  | { kind: 'code_used' };

/**
 * Le code est consommé et la réponse enregistrée dans une même transaction : si l'une échoue, le code
 * n'est pas brûlé. La réponse ne contient ni le code ni aucune heure précise.
 * L'inscription aux nouvelles est écrite après coup, hors transaction, dans une autre table.
 */
export async function submitFeedback(input: FeedbackInput): Promise<SubmitResult> {
  const codeHash = hashCode(input.code);

  try {
    await prisma.$transaction(async (tx) => {
      const consumed = await tx.feedbackCode.updateMany({ where: { codeHash, used: false }, data: { used: true } });
      if (consumed.count !== 1) throw new CodeRejected();
      await tx.feedbackResponse.create({
        data: {
          submittedOn: berlinDay(),
          rating: input.rating,
          highlights: input.highlights,
          likesAndImprovements: input.likesAndImprovements,
          wantedSpeakers: input.wantedSpeakers,
          wantedTopics: input.wantedTopics,
          isSigned: input.isSigned,
          firstName: input.firstName,
          lastName: input.lastName,
        },
      });
    });
  } catch (e) {
    if (!(e instanceof CodeRejected)) throw e;
    const known = await prisma.feedbackCode.findUnique({ where: { codeHash }, select: { id: true } });
    return { kind: known ? 'code_used' : 'code_invalid' };
  }

  if (!input.news) return { kind: 'ok', newsletter: 'none' };
  try {
    await prisma.feedbackNewsSignup.upsert({
      where: { email: input.news.email },
      create: { email: input.news.email, firstName: input.news.firstName, lastName: input.news.lastName },
      update: {
        ...(input.news.firstName ? { firstName: input.news.firstName } : {}),
        ...(input.news.lastName ? { lastName: input.news.lastName } : {}),
      },
    });
    return { kind: 'ok', newsletter: 'saved' };
  } catch {
    return { kind: 'ok', newsletter: 'failed' };
  }
}

// ── Administration : réponses ───────────────────────────────────────────────

function whereFromFilters(f: FeedbackFilters): Prisma.FeedbackResponseWhereInput {
  const where: Prisma.FeedbackResponseWhereInput = {};
  if (f.rating) where.rating = f.rating;
  if (f.from || f.to) {
    where.submittedOn = {
      ...(f.from ? { gte: new Date(`${f.from}T00:00:00.000Z`) } : {}),
      ...(f.to ? { lte: new Date(`${f.to}T00:00:00.000Z`) } : {}),
    };
  }
  if (f.signed) where.isSigned = f.signed === 'signed';
  if (f.tagId) where.tags = { some: { id: f.tagId } };
  if (f.q) {
    where.AND = f.q
      .split(/\s+/)
      .slice(0, 5)
      .map((term) => ({
        OR: (['highlights', 'likesAndImprovements', 'wantedSpeakers', 'wantedTopics', 'firstName', 'lastName'] as const).map(
          (field) => ({ [field]: { contains: term, mode: 'insensitive' as const } }),
        ),
      }));
  }
  return where;
}

const RESPONSE_SELECT = {
  id: true,
  submittedOn: true,
  rating: true,
  highlights: true,
  likesAndImprovements: true,
  wantedSpeakers: true,
  wantedTopics: true,
  isSigned: true,
  firstName: true,
  lastName: true,
  tags: { select: { id: true, name: true }, orderBy: { name: 'asc' as const } },
} satisfies Prisma.FeedbackResponseSelect;

export type AdminFeedbackResponse = Prisma.FeedbackResponseGetPayload<{ select: typeof RESPONSE_SELECT }>;

// Jour décroissant puis id : les ids sont des uuid aléatoires, l'ordre au sein d'un jour est donc sans signification.
const ORDER = [{ submittedOn: 'desc' as const }, { id: 'asc' as const }];

export async function listFeedback(filters: FeedbackFilters, opts: { limit: number; offset: number }) {
  const where = whereFromFilters(filters);
  const [responses, total, byRating] = await Promise.all([
    prisma.feedbackResponse.findMany({ where, orderBy: ORDER, take: opts.limit, skip: opts.offset, select: RESPONSE_SELECT }),
    prisma.feedbackResponse.count({ where }),
    prisma.feedbackResponse.groupBy({ by: ['rating'], where, _count: { _all: true } }),
  ]);

  const distribution = [1, 2, 3, 4, 5].map((r) => byRating.find((g) => g.rating === r)?._count._all ?? 0);
  const rated = distribution.reduce((a, b) => a + b, 0);
  const average = rated ? distribution.reduce((sum, n, i) => sum + n * (i + 1), 0) / rated : null;
  return { responses, total, stats: { average, distribution } };
}

export async function listAllFeedback(filters: FeedbackFilters): Promise<AdminFeedbackResponse[]> {
  return prisma.feedbackResponse.findMany({ where: whereFromFilters(filters), orderBy: ORDER, select: RESPONSE_SELECT });
}

// ── Administration : étiquettes ─────────────────────────────────────────────

/** Remplit les étiquettes par défaut tant que le catalogue est vide. */
export async function listTags() {
  if ((await prisma.feedbackTag.count()) === 0) {
    await prisma.feedbackTag.createMany({
      data: DEFAULT_FEEDBACK_TAGS.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
  const tags = await prisma.feedbackTag.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, _count: { select: { responses: true } } },
  });
  return tags.map((t) => ({ id: t.id, name: t.name, count: t._count.responses }));
}

export type TagResult = { ok: true; id: string; name: string } | { ok: false; code: 'invalid' | 'duplicate' | 'not_found' };

export async function createTag(nameRaw: unknown): Promise<TagResult> {
  const name = cleanTagName(nameRaw);
  if (!name) return { ok: false, code: 'invalid' };
  const same = await prisma.feedbackTag.findFirst({ where: { name: { equals: name, mode: 'insensitive' } }, select: { id: true } });
  if (same) return { ok: false, code: 'duplicate' };
  try {
    const tag = await prisma.feedbackTag.create({ data: { name }, select: { id: true, name: true } });
    return { ok: true, ...tag };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return { ok: false, code: 'duplicate' };
    throw e;
  }
}

export async function renameTag(id: string, nameRaw: unknown): Promise<TagResult> {
  const name = cleanTagName(nameRaw);
  if (!name) return { ok: false, code: 'invalid' };
  const same = await prisma.feedbackTag.findFirst({
    where: { name: { equals: name, mode: 'insensitive' }, NOT: { id } },
    select: { id: true },
  });
  if (same) return { ok: false, code: 'duplicate' };
  try {
    const tag = await prisma.feedbackTag.update({ where: { id }, data: { name }, select: { id: true, name: true } });
    return { ok: true, ...tag };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return { ok: false, code: 'not_found' };
    throw e;
  }
}

export async function deleteTag(id: string): Promise<boolean> {
  const res = await prisma.feedbackTag.deleteMany({ where: { id } });
  return res.count > 0;
}

/** Remplace les étiquettes d'une réponse ; les identifiants inconnus sont ignorés. */
export async function setResponseTags(id: string, tagIds: string[]): Promise<AdminFeedbackResponse | null> {
  const known = await prisma.feedbackTag.findMany({ where: { id: { in: tagIds } }, select: { id: true } });
  try {
    return await prisma.feedbackResponse.update({
      where: { id },
      data: { tags: { set: known } },
      select: RESPONSE_SELECT,
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') return null;
    throw e;
  }
}

// ── Administration : inscriptions aux nouvelles ─────────────────────────────

export async function listNewsSignups() {
  return prisma.feedbackNewsSignup.findMany({
    orderBy: { email: 'asc' },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
}

// ── Administration : codes ──────────────────────────────────────────────────

export async function getCodeStats() {
  const [total, used] = await Promise.all([prisma.feedbackCode.count(), prisma.feedbackCode.count({ where: { used: true } })]);
  return { total, used, unused: total - used };
}

export const MAX_CODES_PER_BATCH = 500;

/** Crée `count` codes et les renvoie en clair UNE seule fois : seuls leurs hash sont conservés. */
export async function generateCodes(count: number): Promise<string[] | null> {
  if (!Number.isInteger(count) || count < 1 || count > MAX_CODES_PER_BATCH) return null;

  const fresh = new Map<string, string>(); // hash → code
  while (fresh.size < count) {
    const batch = new Map<string, string>();
    while (fresh.size + batch.size < count) {
      const code = generateCode(randomInt);
      batch.set(hashCode(code), code);
    }
    const hashes = Array.from(batch.keys());
    const taken = await prisma.feedbackCode.findMany({ where: { codeHash: { in: hashes } }, select: { codeHash: true } });
    const takenSet = new Set(taken.map((t) => t.codeHash));
    batch.forEach((code, hash) => {
      if (!takenSet.has(hash)) fresh.set(hash, code);
    });
  }

  await prisma.feedbackCode.createMany({
    data: Array.from(fresh.keys()).map((codeHash) => ({ codeHash })),
    skipDuplicates: true,
  });
  return Array.from(fresh.values()).map(formatCode);
}
