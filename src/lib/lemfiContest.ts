import { createHash, randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import type { Locale } from '@/i18n/config';
import {
  LEMFI_COUNTER_ID,
  LEMFI_FIRST_NUMBER,
  LEMFI_LAST_NUMBER,
} from '@/config/lemfiContest';
import { isLemfiStatus, parseNumberQuery, type LemfiStatus } from './lemfiContestUtils';

export function hashProof(data: Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

export function generateAccessToken(): string {
  return randomBytes(32).toString('base64url');
}

// ── Numéros : compteur atomique ─────────────────────────────────────────────

/** Crée la ligne du compteur si besoin ; ne repart jamais en dessous d'un numéro déjà attribué. */
async function ensureCounter(): Promise<void> {
  await prisma.$executeRaw`
    INSERT INTO lemfi_contest_counter (id, next_number, updated_at)
    VALUES (
      ${LEMFI_COUNTER_ID},
      GREATEST(${LEMFI_FIRST_NUMBER}, COALESCE((SELECT MAX(sequential_number) + 1 FROM lemfi_contest_entries), ${LEMFI_FIRST_NUMBER})),
      NOW() AT TIME ZONE 'UTC'
    )
    ON CONFLICT (id) DO NOTHING`;
}

export async function isContestFull(): Promise<boolean> {
  const row = await prisma.lemFiContestCounter.findUnique({ where: { id: LEMFI_COUNTER_ID } });
  return !!row && row.nextNumber > LEMFI_LAST_NUMBER;
}

class ContestFullError extends Error {}

// ── Inscription ─────────────────────────────────────────────────────────────

const REGISTERED_SELECT = {
  id: true,
  sequentialNumber: true,
  firstName: true,
  email: true,
  accessToken: true,
  status: true,
  emailSentAt: true,
  emailAttempts: true,
  emailLastAttemptAt: true,
  submissionKey: true,
  locale: true,
} satisfies Prisma.LemFiContestEntrySelect;

export type RegisteredEntry = Prisma.LemFiContestEntryGetPayload<{ select: typeof REGISTERED_SELECT }>;

export type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  submissionKey: string;
  locale?: Locale;
  proof: { data: Buffer; mimeType: string; hash: string };
};

export type RegisterResult =
  | { kind: 'created'; entry: RegisteredEntry }
  | { kind: 'existing'; entry: RegisteredEntry }
  | { kind: 'email_taken' }
  | { kind: 'full' };

function uniqueTarget(e: Prisma.PrismaClientKnownRequestError): string {
  return JSON.stringify(e.meta?.target ?? '');
}

/**
 * Enregistre une participation et lui attribue LU200..LU350.
 *
 * Le numéro est pris par un UPDATE … RETURNING sur la ligne unique du compteur, dans la même
 * transaction que l'INSERT : la ligne est verrouillée, donc deux inscriptions simultanées ne
 * peuvent pas recevoir le même numéro ; si l'INSERT échoue (e-mail déjà inscrit…), la transaction
 * est annulée et le numéro n'est pas consommé. Le compteur ne décroît jamais : aucun numéro réutilisé.
 */
export async function registerEntry(input: RegisterInput): Promise<RegisterResult> {
  const byKey = () =>
    prisma.lemFiContestEntry.findUnique({
      where: { submissionKey: input.submissionKey },
      select: REGISTERED_SELECT,
    });

  // Nouvelle tentative de la même soumission (double clic, coupure réseau) : même participation.
  const retry = await byKey();
  if (retry) return { kind: 'existing', entry: retry };

  const sameEmail = await prisma.lemFiContestEntry.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (sameEmail) return { kind: 'email_taken' };

  await ensureCounter();

  const identical = await prisma.lemFiContestEntry.findFirst({
    where: { proofHash: input.proof.hash },
    orderBy: { sequentialNumber: 'asc' },
    select: { sequentialNumber: true },
  });

  try {
    const entry = await prisma.$transaction(
      async (tx) => {
        const rows = await tx.$queryRaw<{ assigned: number }[]>`
          UPDATE lemfi_contest_counter
          SET next_number = next_number + 1, updated_at = NOW() AT TIME ZONE 'UTC'
          WHERE id = ${LEMFI_COUNTER_ID} AND next_number <= ${LEMFI_LAST_NUMBER}
          RETURNING next_number - 1 AS assigned`;
        if (rows.length === 0) throw new ContestFullError();

        return tx.lemFiContestEntry.create({
          data: {
            sequentialNumber: Number(rows[0]!.assigned),
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            accessToken: generateAccessToken(),
            submissionKey: input.submissionKey,
            locale: input.locale ?? 'fr',
            proofHash: input.proof.hash,
            duplicateOfNumber: identical?.sequentialNumber ?? null,
            consentGiven: true,
            consentAt: new Date(),
            proof: {
              create: {
                mimeType: input.proof.mimeType,
                sizeBytes: input.proof.data.length,
                data: input.proof.data,
              },
            },
          },
          select: REGISTERED_SELECT,
        });
      },
      { maxWait: 10_000, timeout: 20_000 },
    );
    return { kind: 'created', entry };
  } catch (e) {
    if (e instanceof ContestFullError) return { kind: 'full' };
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      // Postgres signale une seule contrainte même si deux sont violées : on regarde d'abord
      // si c'est la même soumission rejouée en parallèle.
      const again = await byKey();
      if (again) return { kind: 'existing', entry: again };
      if (uniqueTarget(e).includes('email')) return { kind: 'email_taken' };
    }
    throw e;
  }
}

// ── Suivi participant ───────────────────────────────────────────────────────

export async function getEntryForParticipant(token: string) {
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;
  return prisma.lemFiContestEntry.findUnique({
    where: { accessToken: token },
    select: {
      sequentialNumber: true,
      firstName: true,
      status: true,
      decisionReason: true,
      decidedAt: true,
      createdAt: true,
      emailSentAt: true,
    },
  });
}

export async function getRegisteredEntryByToken(token: string): Promise<RegisteredEntry | null> {
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) return null;
  return prisma.lemFiContestEntry.findUnique({
    where: { accessToken: token },
    select: REGISTERED_SELECT,
  });
}

// ── E-mail : suivi des envois ───────────────────────────────────────────────

export async function recordEmailAttempt(id: string, result: { ok: true } | { ok: false; error: string }) {
  await prisma.lemFiContestEntry.update({
    where: { id },
    data: {
      emailAttempts: { increment: 1 },
      emailLastAttemptAt: new Date(),
      ...(result.ok
        ? { emailSentAt: new Date(), emailLastError: null }
        : { emailLastError: result.error.slice(0, 300) }),
    },
  });
}

export async function listEntriesWithoutConfirmedEmail(limit: number): Promise<RegisteredEntry[]> {
  return prisma.lemFiContestEntry.findMany({
    where: { emailSentAt: null, emailAttempts: { lt: 8 } },
    orderBy: { createdAt: 'asc' },
    take: limit,
    select: REGISTERED_SELECT,
  });
}

export async function countEntriesWithoutConfirmedEmail(): Promise<number> {
  return prisma.lemFiContestEntry.count({ where: { emailSentAt: null } });
}

// ── Administration ──────────────────────────────────────────────────────────

export async function listEntriesForAdmin(opts: {
  status?: string | null;
  q?: string | null;
  limit: number;
  offset: number;
}) {
  const where: Prisma.LemFiContestEntryWhereInput = {};
  if (isLemfiStatus(opts.status)) where.status = opts.status;

  const q = opts.q?.trim().slice(0, 100);
  if (q) {
    const num = parseNumberQuery(q);
    if (num !== null) {
      where.sequentialNumber = num;
    } else {
      where.AND = q
        .split(/\s+/)
        .slice(0, 5)
        .map((term) => ({
          OR: [
            { firstName: { contains: term, mode: 'insensitive' as const } },
            { lastName: { contains: term, mode: 'insensitive' as const } },
            { email: { contains: term, mode: 'insensitive' as const } },
          ],
        }));
    }
  }

  const [rows, total] = await Promise.all([
    prisma.lemFiContestEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: opts.limit,
      skip: opts.offset,
      select: {
        id: true,
        sequentialNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        decisionReason: true,
        decidedAt: true,
        createdAt: true,
        emailSentAt: true,
        emailAttempts: true,
        emailLastError: true,
        duplicateOfNumber: true,
        proofHash: true,
        winner: { select: { prize: true, status: true } },
      },
    }),
    prisma.lemFiContestEntry.count({ where }),
  ]);

  const hashes = Array.from(new Set(rows.map((r) => r.proofHash).filter((h): h is string => !!h)));
  const sharing = hashes.length
    ? await prisma.lemFiContestEntry.groupBy({
        by: ['proofHash'],
        where: { proofHash: { in: hashes } },
        _count: { _all: true },
      })
    : [];
  const sameProof = new Map(sharing.map((g) => [g.proofHash, g._count._all]));

  const entries = rows.map(({ proofHash, ...r }) => ({
    ...r,
    sameProofCount: proofHash ? sameProof.get(proofHash) ?? 1 : 1,
  }));
  return { entries, total };
}

export async function getAdminStats() {
  const [groups, counter] = await Promise.all([
    prisma.lemFiContestEntry.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.lemFiContestCounter.findUnique({ where: { id: LEMFI_COUNTER_ID } }),
  ]);
  const n = (s: LemfiStatus) => groups.find((g) => g.status === s)?._count._all ?? 0;
  const pending = n('pending');
  const validated = n('validated');
  const rejected = n('rejected');
  return {
    pending,
    validated,
    rejected,
    total: pending + validated + rejected,
    numbersIssued: counter ? Math.min(counter.nextNumber, LEMFI_LAST_NUMBER + 1) - LEMFI_FIRST_NUMBER : 0,
  };
}

export async function getEntryDetailForAdmin(id: string) {
  return prisma.lemFiContestEntry.findUnique({
    where: { id },
    select: {
      id: true,
      sequentialNumber: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      decisionReason: true,
      decidedAt: true,
      createdAt: true,
      consentAt: true,
      emailSentAt: true,
      emailAttempts: true,
      emailLastError: true,
      duplicateOfNumber: true,
      proofHash: true,
      proof: { select: { mimeType: true, sizeBytes: true } },
      winner: { select: { prize: true, status: true } },
      decisions: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, fromStatus: true, toStatus: true, reason: true, createdAt: true },
      },
    },
  });
}

export async function getProof(id: string) {
  return prisma.lemFiContestProof.findUnique({
    where: { entryId: id },
    select: { mimeType: true, data: true },
  });
}

export type DecideResult =
  | { ok: true }
  | { ok: false; code: 'not_found' | 'unchanged' | 'reason_required' };

/** Valider ou refuser ; le numéro LU ne change jamais. Chaque décision est conservée dans l'historique. */
export async function decideEntry(
  id: string,
  toStatus: 'validated' | 'rejected',
  reasonRaw: string | null | undefined,
): Promise<DecideResult> {
  const reason = reasonRaw?.trim().slice(0, 500) || null;
  if (toStatus === 'rejected' && !reason) return { ok: false, code: 'reason_required' };

  return prisma.$transaction(async (tx): Promise<DecideResult> => {
    const current = await tx.lemFiContestEntry.findUnique({ where: { id }, select: { status: true } });
    if (!current) return { ok: false, code: 'not_found' };
    if (current.status === toStatus) return { ok: false, code: 'unchanged' };

    await tx.lemFiContestEntry.update({
      where: { id },
      data: { status: toStatus, decisionReason: reason, decidedAt: new Date() },
    });
    await tx.lemFiContestDecision.create({
      data: { entryId: id, fromStatus: current.status, toStatus, reason },
    });
    return { ok: true };
  });
}

export async function getRegisteredEntryById(id: string): Promise<RegisteredEntry | null> {
  return prisma.lemFiContestEntry.findUnique({ where: { id }, select: REGISTERED_SELECT });
}

// ── Conservation ────────────────────────────────────────────────────────────

function cutoff(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function countExpiredEntries(days: number): Promise<number> {
  return prisma.lemFiContestEntry.count({ where: { createdAt: { lt: cutoff(days) } } });
}

/** Supprime participations, preuves et historique plus anciens que `days` ; les numéros ne sont pas réattribués. */
export async function purgeExpiredEntries(days: number): Promise<number> {
  const res = await prisma.lemFiContestEntry.deleteMany({ where: { createdAt: { lt: cutoff(days) } } });
  return res.count;
}
