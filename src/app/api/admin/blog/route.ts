import { NextRequest, NextResponse } from 'next/server';
import { normalizeBlogCoverImageUrl } from '@/lib/blogCoverImage';
import {
  normalizeBlogTranslations,
  pickLegacyMirror,
  type BlogTranslationsPayload,
} from '@/lib/blogTranslation';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: 'desc' },
    include: { translations: true },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const payload = await req.json();
  const {
    coverImage,
    author,
    category,
    published,
    publishedAt,
    translations: translationsPayload,
    // Legacy single-language inputs (kept for backwards compat).
    title: legacyTitle,
    body: legacyBody,
  } = payload as {
    coverImage?: string | null;
    author?: string;
    category?: string | null;
    published?: boolean;
    publishedAt?: string | null;
    translations?: BlogTranslationsPayload;
    title?: string;
    body?: string;
  };

  const translations = normalizeBlogTranslations(translationsPayload);

  // Backwards-compat: if no per-locale translations were sent but a flat
  // {title, body} was, synthesize a French translation from it.
  if (!translations.length && legacyTitle && legacyBody) {
    translations.push({
      locale: 'fr',
      title: legacyTitle.trim(),
      body: legacyBody.trim(),
      excerpt: null,
      metaTitle: null,
      metaDescription: null,
    });
  }

  if (!translations.length) {
    return NextResponse.json(
      { error: 'Au moins une langue (titre + contenu) est obligatoire.' },
      { status: 400 },
    );
  }

  const mirror = pickLegacyMirror(translations)!;

  let publishedAtDate: Date | null = null;
  if (publishedAt) {
    const d = new Date(publishedAt);
    if (!Number.isNaN(d.getTime())) publishedAtDate = d;
  } else if (published) {
    publishedAtDate = new Date();
  }

  const post = await prisma.blogPost.create({
    data: {
      title: mirror.title,
      body: mirror.body,
      coverImage: normalizeBlogCoverImageUrl(coverImage),
      author: author ?? undefined,
      category: category ?? null,
      published: published ?? false,
      publishedAt: publishedAtDate,
      translations: {
        create: translations.map((t) => ({
          locale: t.locale,
          title: t.title,
          body: t.body,
          excerpt: t.excerpt,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
        })),
      },
    },
    include: { translations: true },
  });

  return NextResponse.json(post, { status: 201 });
}
