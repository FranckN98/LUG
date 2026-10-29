import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { syncHeroMediaToSlides } from '@/lib/heroSync';
import { isPresignedS3Url } from '@/lib/presignedUrl';
import { RehostError, rehostPresignedImage } from '@/lib/rehostImage';

// GET /api/admin/hero — list all slides
export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  await syncHeroMediaToSlides().catch(() => undefined);
  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
  return NextResponse.json(slides);
}

// POST /api/admin/hero — create a slide
export async function POST(req: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const {
    imageUrl: rawImageUrl, isMain, titleFr, titleDe, titleEn,
    subtitleFr, subtitleDe, subtitleEn,
    altTextFr, altTextDe, altTextEn,
    linkType, linkTarget, isActive, sortOrder,
  } = body;

  if (!rawImageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });

  // Un lien S3 signé expire en quelques minutes : l'image est hébergée sur le site pour que le hero ne casse pas.
  let imageUrl: string = rawImageUrl;
  if (isPresignedS3Url(rawImageUrl)) {
    try {
      imageUrl = (await rehostPresignedImage(rawImageUrl)).url;
    } catch (e) {
      const status = e instanceof RehostError ? e.status : 500;
      return NextResponse.json({ error: e instanceof RehostError ? e.message : 'Stockage indisponible.' }, { status });
    }
  }

  // If setting as main, unset all others
  if (isMain) {
    await prisma.heroSlide.updateMany({ data: { isMain: false } });
  }

  const fields = {
    isMain: !!isMain,
    titleFr, titleDe, titleEn,
    subtitleFr, subtitleDe, subtitleEn,
    altTextFr, altTextDe, altTextEn,
    linkType, linkTarget,
    isActive: isActive !== false,
    sortOrder: sortOrder ?? 0,
  };

  // Une image déjà dans le carousel (ex. ajoutée automatiquement depuis la médiathèque) est mise à jour, pas dupliquée.
  const existing = await prisma.heroSlide.findFirst({ where: { imageUrl } });
  if (existing) {
    const updated = await prisma.heroSlide.update({ where: { id: existing.id }, data: fields });
    return NextResponse.json(updated);
  }

  const slide = await prisma.heroSlide.create({ data: { imageUrl, ...fields } });
  return NextResponse.json(slide, { status: 201 });
}
