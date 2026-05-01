import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ ok: false, error: 'invalid_id' }, { status: 400 });

    const post = await prisma.blogPost.findUnique({ where: { id }, select: { id: true } });
    if (!post) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

    const cookieStore = cookies();
    const cookieName = `blog_liked_${id}`;
    const already = cookieStore.get(cookieName)?.value === '1';

    if (already) {
      const fresh = await prisma.blogPost.findUnique({ where: { id }, select: { likes: true } });
      return NextResponse.json({ ok: true, liked: true, likes: fresh?.likes ?? 0, alreadyLiked: true });
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });

    await prisma.blogInteraction.create({
      data: { blogPostId: id, type: 'like' },
    });

    const res = NextResponse.json({ ok: true, liked: true, likes: updated.likes });
    res.cookies.set(cookieName, '1', {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
    return res;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[blog/like]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ ok: false, error: 'invalid_id' }, { status: 400 });

    const cookieStore = cookies();
    const cookieName = `blog_liked_${id}`;
    const already = cookieStore.get(cookieName)?.value === '1';
    if (!already) {
      const fresh = await prisma.blogPost.findUnique({ where: { id }, select: { likes: true } });
      return NextResponse.json({ ok: true, liked: false, likes: fresh?.likes ?? 0 });
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: { likes: { decrement: 1 } },
      select: { likes: true },
    });

    const res = NextResponse.json({ ok: true, liked: false, likes: Math.max(0, updated.likes) });
    res.cookies.set(cookieName, '', { maxAge: 0, path: '/' });
    return res;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[blog/unlike]', e);
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
