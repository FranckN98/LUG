import { NextRequest, NextResponse } from 'next/server';
import { normalizeBlogCoverImageUrl } from '@/lib/blogCoverImage';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const { title, body, coverImage, author, category, published, publishedAt } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: 'Titre et contenu requis.' }, { status: 400 });
  }
  let publishedAtDate: Date | null = null;
  if (publishedAt) {
    const d = new Date(publishedAt);
    if (!Number.isNaN(d.getTime())) publishedAtDate = d;
  } else if (published) {
    publishedAtDate = new Date();
  }
  const post = await prisma.blogPost.create({
    data: {
      title,
      body,
      coverImage: normalizeBlogCoverImageUrl(coverImage),
      author,
      category,
      published: published ?? false,
      publishedAt: publishedAtDate,
    },
  });
  return NextResponse.json(post, { status: 201 });
}
