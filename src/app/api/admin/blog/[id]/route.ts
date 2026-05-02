import { NextRequest, NextResponse } from 'next/server';
import { normalizeBlogCoverImageUrl } from '@/lib/blogCoverImage';
import {
  normalizeBlogTranslations,
  pickLegacyMirror,
  type BlogTranslationsPayload,
} from '@/lib/blogTranslation';
import { prisma } from '@/lib/prisma';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { translations: true },
  });
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const has = (k: string) => Object.prototype.hasOwnProperty.call(data, k);

  // Normalize publishedAt: accept ISO string, null, or undefined.
  let publishedAtUpdate: Date | null | undefined = undefined;
  if (has('publishedAt')) {
    if (data.publishedAt === null || data.publishedAt === '') {
      publishedAtUpdate = null;
    } else {
      const d = new Date(data.publishedAt);
      publishedAtUpdate = Number.isNaN(d.getTime()) ? null : d;
    }
  } else if (data.published === true) {
    const existing = await prisma.blogPost.findUnique({
      where: { id: params.id },
      select: { publishedAt: true },
    });
    if (existing && !existing.publishedAt) publishedAtUpdate = new Date();
  }

  // Translations (optional on PATCH).
  let translationsUpdate: ReturnType<typeof normalizeBlogTranslations> | null = null;
  if (has('translations')) {
    translationsUpdate = normalizeBlogTranslations(data.translations as BlogTranslationsPayload);
    if (!translationsUpdate.length) {
      return NextResponse.json(
        { error: 'Au moins une langue (titre + contenu) est obligatoire.' },
        { status: 400 },
      );
    }
  }

  const mirror = translationsUpdate ? pickLegacyMirror(translationsUpdate) : null;

  // Build the scalar update, excluding fields handled separately.
  const scalarData: Record<string, unknown> = {};
  if (has('coverImage')) scalarData.coverImage = normalizeBlogCoverImageUrl(data.coverImage);
  if (has('author')) scalarData.author = data.author;
  if (has('category')) scalarData.category = data.category ?? null;
  if (has('published')) scalarData.published = !!data.published;
  if (publishedAtUpdate !== undefined) scalarData.publishedAt = publishedAtUpdate;
  if (mirror) {
    scalarData.title = mirror.title;
    scalarData.body = mirror.body;
  } else {
    if (has('title')) scalarData.title = data.title;
    if (has('body')) scalarData.body = data.body;
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(scalarData).length) {
      await tx.blogPost.update({ where: { id: params.id }, data: scalarData });
    }
    if (translationsUpdate) {
      for (const t of translationsUpdate) {
        await tx.blogPostTranslation.upsert({
          where: { blogPostId_locale: { blogPostId: params.id, locale: t.locale } },
          create: {
            blogPostId: params.id,
            locale: t.locale,
            title: t.title,
            body: t.body,
            excerpt: t.excerpt,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
          },
          update: {
            title: t.title,
            body: t.body,
            excerpt: t.excerpt,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
          },
        });
      }
    }
  });

  const post = await prisma.blogPost.findUnique({
    where: { id: params.id },
    include: { translations: true },
  });
  return NextResponse.json(post);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.blogPost.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
