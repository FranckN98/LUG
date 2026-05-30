import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { params: { slug: string } };

export async function GET(request: Request, { params }: Params) {
  const doc = await prisma.sponsorDocument.findUnique({
    where: { slug: params.slug },
    select: { url: true, filename: true, mimeType: true, isPublic: true },
  });

  if (!doc || !doc.isPublic) {
    return new NextResponse('PDF introuvable.', { status: 404 });
  }

  // Local-served file: lightweight redirect (already on the site domain).
  if (doc.url.startsWith('/')) {
    return NextResponse.redirect(new URL(doc.url, request.url), 302);
  }

  // External (Vercel Blob, etc.) — proxy-stream so the URL stays on www.levelupingermany.com.
  const upstream = await fetch(doc.url);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse('PDF momentanément indisponible.', { status: 502 });
  }

  const headers = new Headers();
  headers.set('Content-Type', doc.mimeType || 'application/pdf');
  const length = upstream.headers.get('content-length');
  if (length) headers.set('Content-Length', length);
  const safeName = (doc.filename || 'document.pdf').replace(/[^\w.\-]+/g, '_');
  headers.set('Content-Disposition', `inline; filename="${safeName}"`);
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');

  return new NextResponse(upstream.body, { status: 200, headers });
}
