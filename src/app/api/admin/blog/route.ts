import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const { title, body, coverImage, author, category, published } = await req.json();
  if (!title || !body) {
    return NextResponse.json({ error: 'Titre et contenu requis.' }, { status: 400 });
  }
  const post = await prisma.blogPost.create({
    data: { title, body, coverImage, author, category, published: published ?? false },
  });
  return NextResponse.json(post, { status: 201 });
}
