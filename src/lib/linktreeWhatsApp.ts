import 'server-only';
import { prisma } from '@/lib/prisma';
import { DEFAULT_WHATSAPP_URL } from '@/lib/emailFooter';

/**
 * Resolve the WhatsApp community URL from the public Linktree (admin-managed)
 * so transactional emails always point to whatever channel/group the team is
 * currently promoting. Falls back to the hardcoded ambassador group if the
 * Linktree has no active WhatsApp link or the DB is unreachable.
 *
 * Server-only: imports Prisma. Do not import from client components.
 */
export async function getLinktreeWhatsAppUrl(): Promise<string> {
  try {
    const link = await prisma.socialLink.findFirst({
      where: {
        isActive: true,
        OR: [
          { title: { contains: 'WhatsApp', mode: 'insensitive' } },
          { url: { contains: 'whatsapp.com', mode: 'insensitive' } },
          { url: { contains: 'wa.me', mode: 'insensitive' } },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: { url: true },
    });
    const url = link?.url?.trim();
    if (url) return url;
  } catch {
    // fall through to fallback
  }
  return DEFAULT_WHATSAPP_URL;
}
