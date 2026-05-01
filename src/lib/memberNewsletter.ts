import { prisma } from '@/lib/prisma';

/**
 * Idempotently subscribes a member to the newsletter.
 * - Adds the email to `NewsletterSubscriber` if missing.
 * - If already present, sets `consent=true` and ensures the `member` tag is included.
 */
export async function subscribeMemberToNewsletter(params: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}): Promise<void> {
  const email = params.email.trim().toLowerCase();
  if (!email) return;

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });
  const fullName =
    [params.firstName, params.lastName].filter((s): s is string => Boolean(s && s.trim())).join(' ').trim() || null;

  if (!existing) {
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName: params.firstName ?? null,
        lastName: params.lastName ?? null,
        name: fullName,
        source: 'member_accepted',
        consent: true,
        tags: 'newsletter,member',
      },
    });
    return;
  }

  // Ensure consent + add 'member' tag if missing
  const tags = (existing.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean);
  if (!tags.includes('member')) tags.push('member');
  if (!tags.includes('newsletter')) tags.push('newsletter');

  await prisma.newsletterSubscriber.update({
    where: { email },
    data: {
      consent: true,
      tags: tags.join(','),
      ...(existing.firstName || existing.lastName
        ? {}
        : {
            firstName: params.firstName ?? null,
            lastName: params.lastName ?? null,
            name: existing.name ?? fullName,
          }),
    },
  });
}

/**
 * Backfills the newsletter list with all currently accepted members.
 * Idempotent; safe to call multiple times.
 * Returns the number of members processed.
 */
export async function backfillAcceptedMembersToNewsletter(): Promise<number> {
  try {
    const members = await prisma.member.findMany({
      where: { applicationStatus: 'accepted' },
      select: { email: true, firstName: true, lastName: true },
    });
    for (const m of members) {
      await subscribeMemberToNewsletter({
        email: m.email,
        firstName: m.firstName,
        lastName: m.lastName,
      });
    }
    return members.length;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[backfillAcceptedMembersToNewsletter]', e);
    return 0;
  }
}
