import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { parseNameFromEmail } from '@/lib/emailName';

/**
 * Backfill `firstName`/`lastName` for subscribers that don't have them yet,
 * using whatever info is already available: the stored `name` (split into
 * tokens) or, failing that, the email local-part (see lib/emailName.ts).
 * Safe to re-run: only touches rows where `firstName` is still empty.
 */
export async function POST() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const candidates = await prisma.newsletterSubscriber.findMany({
    where: { OR: [{ firstName: null }, { firstName: '' }] },
    select: { id: true, email: true, name: true },
  });

  let updated = 0;
  let unresolved = 0;

  for (const sub of candidates) {
    let firstName: string | null = null;
    let lastName: string | null = null;

    if (sub.name && sub.name.trim()) {
      const tokens = sub.name.trim().split(/\s+/).filter(Boolean);
      firstName = tokens[0] || null;
      lastName = tokens.length > 1 ? tokens.slice(1).join(' ') : null;
    }

    if (!firstName) {
      const parsed = parseNameFromEmail(sub.email);
      firstName = parsed.firstName;
      lastName = parsed.lastName;
    }

    if (!firstName) {
      unresolved += 1;
      continue;
    }

    await prisma.newsletterSubscriber.update({
      where: { id: sub.id },
      data: {
        firstName,
        lastName,
        name: sub.name && sub.name.trim() ? undefined : [firstName, lastName].filter(Boolean).join(' '),
      },
    });
    updated += 1;
  }

  return NextResponse.json({ scanned: candidates.length, updated, unresolved });
}
