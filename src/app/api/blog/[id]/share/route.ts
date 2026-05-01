import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ALLOWED_CHANNELS = new Set(['native', 'copy', 'twitter', 'facebook', 'linkedin', 'whatsapp', 'email']);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ ok: false, error: 'invalid_id' }, { status: 400 });

    const body = (await req.json().catch(() => ({}))) as { channel?: string };
    const channel = body.channel && ALLOWED_CHANNELS.has(body.channel) ? body.channel : 'native';

    const post = await prisma.blogPost.findUnique({ where: { id }, select: { id: true } });
    if (!post) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    const updated = await prisma.blogPost.update({
      where: { id },
      data: { shares: { increment: 1 } },
      select: { shares: true },
    });

    await prisma.blogInteraction.create({
      data: { blogPostId: id, type: 'share', shareChannel: channel },
    });

    return NextResponse.json({ ok: true, shares: updated.shares });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[blog/share]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
