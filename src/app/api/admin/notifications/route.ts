import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [pendingMembers, unreadMessages, unseenInteractions, recentMembers, recentMessages, recentInteractions] = await Promise.all([
      prisma.member.count({ where: { applicationStatus: 'pending' } }),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.blogInteraction.count({ where: { seenByAdmin: false } }),
      prisma.member.findMany({
        where: { applicationStatus: 'pending' },
        select: { id: true, firstName: true, lastName: true, email: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.contactMessage.findMany({
        where: { read: false },
        select: { id: true, name: true, email: true, message: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.blogInteraction.findMany({
        where: { seenByAdmin: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          type: true,
          shareChannel: true,
          createdAt: true,
          blogPost: { select: { id: true, title: true } },
        },
      }),
    ]);

    const total = pendingMembers + unreadMessages + unseenInteractions;

    return NextResponse.json({
      ok: true,
      counts: {
        members: pendingMembers,
        messages: unreadMessages,
        blog: unseenInteractions,
        total,
      },
      items: {
        members: recentMembers,
        messages: recentMessages,
        blog: recentInteractions,
      },
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[admin/notifications]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { categories?: string[] };
    const cats = Array.isArray(body.categories) && body.categories.length > 0 ? body.categories : ['messages', 'blog'];

    if (cats.includes('messages')) {
      await prisma.contactMessage.updateMany({ where: { read: false }, data: { read: true } });
    }
    if (cats.includes('blog')) {
      await prisma.blogInteraction.updateMany({ where: { seenByAdmin: false }, data: { seenByAdmin: true } });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[admin/notifications/mark-seen]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
