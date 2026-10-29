import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { syncHeroMediaToSlides } from '@/lib/heroSync';
import { isPresignedS3Url } from '@/lib/presignedUrl';
import { RehostError, rehostPresignedImage } from '@/lib/rehostImage';

// POST /api/admin/media/rehost — { url, category? } : héberge sur le site une image servie par un lien S3 signé (qui expire en minutes).
export async function POST(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const body = (await request.json().catch(() => null)) as { url?: unknown; category?: unknown } | null;
  const url = typeof body?.url === 'string' ? body.url.trim() : '';
  const category = typeof body?.category === 'string' && body.category.trim() ? body.category.trim() : 'general';
  if (!isPresignedS3Url(url)) {
    return NextResponse.json({ error: "Ce n'est pas un lien S3 signé." }, { status: 400 });
  }

  try {
    const saved = await rehostPresignedImage(url, category === 'community' ? 'community' : 'media');
    const media = await prisma.media.create({
      data: { filename: saved.filename, url: saved.url, altText: '', category, size: saved.size, mimeType: saved.mimeType },
    });
    if (category === 'hero') await syncHeroMediaToSlides().catch(() => undefined);
    return NextResponse.json({ url: media.url, id: media.id }, { status: 201 });
  } catch (e) {
    if (e instanceof RehostError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Enregistrement de l'image impossible (stockage indisponible)." }, { status: 500 });
  }
}
