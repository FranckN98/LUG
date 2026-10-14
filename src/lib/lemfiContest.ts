import { prisma } from './prisma';
import { randomBytes } from 'crypto';

const CONTEST_START = 200;
const CONTEST_END = 350;
const CONTEST_TOTAL = CONTEST_END - CONTEST_START + 1; // 151 entries

/**
 * Get the next available sequential number for a contest entry.
 * Handles concurrent inserts safely via database uniqueness.
 */
export async function getNextSequentialNumber(): Promise<number | null> {
  const count = await prisma.lemFiContestEntry.count();
  if (count >= CONTEST_TOTAL) return null; // Contest full

  const nextNumber = CONTEST_START + count;
  return nextNumber;
}

/**
 * Generate a secure access token for a participant.
 * Used to check their entry status without exposing admin data.
 */
export function generateAccessToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Check if contest is full (151 entries reached).
 */
export async function isContestFull(): Promise<boolean> {
  const count = await prisma.lemFiContestEntry.count();
  return count >= CONTEST_TOTAL;
}

/**
 * Get entry display number (e.g., "LU200", "LU201", ...).
 */
export function getDisplayNumber(sequentialNumber: number): string {
  return `LU${sequentialNumber}`;
}

/**
 * Check if email already has an active entry.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  const existing = await prisma.lemFiContestEntry.findUnique({
    where: { email },
    select: { id: true },
  });
  return !!existing;
}

/**
 * Hash screenshot content to detect duplicates.
 */
export function hashScreenshot(buffer: Buffer): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Check if screenshot hash already exists (duplicate protection).
 */
export async function checkScreenshotDuplicate(hash: string): Promise<boolean> {
  const existing = await prisma.lemFiContestEntry.findFirst({
    where: { screenshotHash: hash },
    select: { id: true },
  });
  return !!existing;
}

/**
 * Create a contest entry with atomic sequential number assignment.
 * Retries on conflict to handle race conditions.
 */
export async function createContestEntry(data: {
  firstName: string;
  lastName: string;
  email: string;
  screenshotUrl: string;
  screenshotHash: string;
  consentGiven: boolean;
}): Promise<{ entry: any; displayNumber: string } | null> {
  // Check if email already exists
  const existing = await prisma.lemFiContestEntry.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existing) {
    throw new Error('Email already registered');
  }

  // Get next sequential number
  const nextNumber = await getNextSequentialNumber();
  if (!nextNumber) {
    throw new Error('Contest is full');
  }

  const accessToken = generateAccessToken();

  try {
    const entry = await prisma.lemFiContestEntry.create({
      data: {
        sequentialNumber: nextNumber,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.toLowerCase().trim(),
        screenshotUrl: data.screenshotUrl,
        screenshotHash: data.screenshotHash,
        accessToken,
        consentGiven: data.consentGiven,
        status: 'pending',
      },
    });

    return {
      entry,
      displayNumber: getDisplayNumber(entry.sequentialNumber),
    };
  } catch (error: any) {
    // Handle race condition: another entry claimed this number
    if (error.code === 'P2002' && error.meta?.target?.includes('sequential_number')) {
      // Retry: call recursively
      return createContestEntry(data);
    }
    throw error;
  }
}

/**
 * Get entry by access token (participant view).
 */
export async function getEntryByAccessToken(accessToken: string) {
  return prisma.lemFiContestEntry.findUnique({
    where: { accessToken },
    select: {
      id: true,
      sequentialNumber: true,
      firstName: true,
      lastName: true,
      status: true,
      rejectionReason: true,
      createdAt: true,
      validatedAt: true,
      rejectedAt: true,
    },
  });
}

/**
 * Get entry with full details (admin view).
 */
export async function getEntryById(id: string) {
  return prisma.lemFiContestEntry.findUnique({
    where: { id },
    include: {
      // future: validations if needed
    },
  });
}

/**
 * List all entries for admin (paginated).
 */
export async function listEntriesForAdmin(options: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { status, search, limit = 50, offset = 0 } = options;

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { sequentialNumber: isNaN(parseInt(search)) ? undefined : parseInt(search) },
    ].filter(Boolean);
  }

  const [entries, total] = await Promise.all([
    prisma.lemFiContestEntry.findMany({
      where,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        sequentialNumber: true,
        firstName: true,
        lastName: true,
        email: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
        validatedAt: true,
        screenshotUrl: true,
        consentGiven: true,
      },
      take: limit,
      skip: offset,
    }),
    prisma.lemFiContestEntry.count({ where }),
  ]);

  return { entries, total };
}

/**
 * Update entry status (validate/reject).
 */
export async function updateEntryStatus(
  id: string,
  status: 'validated' | 'rejected',
  rejectionReason?: string
) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'validated') {
    updateData.validatedAt = new Date();
  } else if (status === 'rejected') {
    updateData.rejectedAt = new Date();
    updateData.rejectionReason = rejectionReason || null;
  }

  const entry = await prisma.lemFiContestEntry.update({
    where: { id },
    data: updateData,
  });

  // Log validation action
  await prisma.lemFiContestValidation.create({
    data: {
      entryId: id,
      action: status,
      reason: rejectionReason,
    },
  });

  return entry;
}

/**
 * Get entry count by status.
 */
export async function getEntryStats() {
  const stats = await prisma.lemFiContestEntry.groupBy({
    by: ['status'],
    _count: true,
  });

  return {
    pending: stats.find((s) => s.status === 'pending')?._count || 0,
    validated: stats.find((s) => s.status === 'validated')?._count || 0,
    rejected: stats.find((s) => s.status === 'rejected')?._count || 0,
    total: stats.reduce((sum, s) => sum + s._count, 0),
  };
}
