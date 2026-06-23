import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Branded direct download URL: https://www.levelupingermany.com/ebook.pdf
 * Proxy-streams the 1st-edition book from Vercel Blob so the long storage
 * URL never leaks, while the public link stays on the site domain and ends in .pdf.
 */
const BOOK_BLOB_URL =
  'https://ilehbjm6jtrg2e7b.public.blob.vercel-storage.com/eBook/Level%20Up%20in%20Germany%202025%20EBook.pdf';

export async function GET() {
  const upstream = await fetch(BOOK_BLOB_URL);
  if (!upstream.ok || !upstream.body) {
    return new NextResponse('PDF momentanément indisponible.', { status: 502 });
  }

  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('content-type') || 'application/pdf');
  const length = upstream.headers.get('content-length');
  if (length) headers.set('Content-Length', length);
  headers.set(
    'Content-Disposition',
    'inline; filename="Level Up in Germany 2025 - eBook.pdf"',
  );
  headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');

  return new NextResponse(upstream.body, { status: 200, headers });
}
