import { NextRequest, NextResponse } from 'next/server';
import { isAllowedExternalImageUrl, normalizeBlogCoverImageUrl } from '@/lib/blogCoverImage';

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get('url');
  const imageUrl = normalizeBlogCoverImageUrl(rawUrl);

  if (!imageUrl || !isAllowedExternalImageUrl(imageUrl)) {
    return new NextResponse('Invalid image URL.', { status: 400 });
  }

  const upstream = await fetch(imageUrl, {
    headers: {
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
    redirect: 'follow',
    cache: 'force-cache',
  });

  if (!upstream.ok) {
    return new NextResponse('Unable to fetch image.', { status: upstream.status });
  }

  const contentType = upstream.headers.get('content-type');
  if (!contentType || !contentType.startsWith('image/')) {
    return new NextResponse('Unsupported image response.', { status: 415 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}