import { NextRequest, NextResponse } from 'next/server';
import { normalizeBlogCoverImageUrl } from '@/lib/blogCoverImage';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const post = await prisma.blogPost.update({
    where: { id: params.id },
    data: {
      ...data,
      coverImage:
        Object.prototype.hasOwnProperty.call(data, 'coverImage')
          ? normalizeBlogCoverImageUrl(data.coverImage)
          : undefined,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
