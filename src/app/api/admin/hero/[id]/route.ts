import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { isPresignedS3Url } from '@/lib/presignedUrl';
import { RehostError, rehostPresignedImage } from '@/lib/rehostImage';

// PATCH /api/admin/hero/[id]
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = await req.json();

  if (typeof body.imageUrl === 'string' && isPresignedS3Url(body.imageUrl)) {
    try {
      body.imageUrl = (await rehostPresignedImage(body.imageUrl)).url;
    } catch (e) {
      const status = e instanceof RehostError ? e.status : 500;
      return NextResponse.json({ error: e instanceof RehostError ? e.message : 'Stockage indisponible.' }, { status });
    }
  }

  // If setting as main, unset all others first
  if (body.isMain) {
    await prisma.heroSlide.updateMany({ data: { isMain: false } });
  }

  const slide = await prisma.heroSlide.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(slide);
}

// DELETE /api/admin/hero/[id]
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  // La médiathèque hero et le carousel forment une seule liste : sans cela l'image réapparaîtrait à la prochaine synchronisation.
  const slide = await prisma.heroSlide.findUnique({ where: { id: params.id } });
  await prisma.heroSlide.delete({ where: { id: params.id } });
  if (slide) await prisma.media.deleteMany({ where: { category: 'hero', url: slide.imageUrl } });
  return NextResponse.json({ success: true });
}
