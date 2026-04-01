import { NextResponse } from 'next/server';
import { getPublicEventGallery } from '@/lib/eventGallery';

export async function GET(_request: Request, { params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  if (year !== '2025' && year !== '2026') {
    return NextResponse.json({ urls: [] as string[] }, { status: 400 });
  }
  const urls = getPublicEventGallery(year);
  return NextResponse.json({ urls });
}
