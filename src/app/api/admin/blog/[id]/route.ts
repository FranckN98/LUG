import { NextRequest, NextResponse } from 'next/server';
import { normalizeBlogCoverImageUrl } from '@/lib/blogCoverImage';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();

  // Normalize publishedAt: accept ISO string, null, or undefined
  let publishedAtUpdate: Date | null | undefined = undefined;
  if (Object.prototype.hasOwnProperty.call(data, 'publishedAt')) {
    if (data.publishedAt === null || data.publishedAt === '') {
      publishedAtUpdate = null;
    } else {
      const d = new Date(data.publishedAt);
      publishedAtUpdate = Number.isNaN(d.getTime()) ? null : d;
    }
  } else if (data.published === true) {
    // Auto-set publishedAt when transitioning to published if not already set
    const existing = await prisma.blogPost.findUnique({ where: { id: params.id }, select: { publishedAt: true } });
    if (existing && !existing.publishedAt) publishedAtUpdate = new Date();
  }

  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      ...data,
      coverImage:
        Object.prototype.hasOwnProperty.call(data, 'coverImage')
          ? normalizeBlogCoverImageUrl(data.coverImage)
          : undefined,
      publishedAt: publishedAtUpdate,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
