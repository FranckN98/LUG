import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { resolveSocialLinkCoverImage, seedSocialLinksIfEmpty, translateSocialLinkFields } from '@/lib/socialLinks';

function parseUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith('/')) return value;
  if (value.startsWith('mailto:') || value.startsWith('tel:')) return value;

  let candidate = value;
  if (!/^https?:\/\//i.test(candidate)) {
    const looksLikeHostname = /^(?:www\.)?[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(candidate) || candidate.includes('instagram.com') || candidate.includes('linkedin.com') || candidate.includes('facebook.com') || candidate.includes('youtube.com') || candidate.includes('tiktok.com') || candidate.includes('x.com');
    if (looksLikeHostname) candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  await seedSocialLinksIfEmpty();

  const links = await prisma.socialLink.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    include: { translations: true },
  });

  return NextResponse.json(links);
}

export async function POST(request: Request) {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Corps JSON invalide.' }, { status: 400 });
  }

  const data = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const title = typeof data.title === 'string' ? data.title.trim() : '';
  const url = parseUrl(data.url);

  if (!title) return NextResponse.json({ error: 'Le titre est requis.' }, { status: 400 });
  if (!url) return NextResponse.json({ error: 'URL invalide.' }, { status: 400 });

  const description = typeof data.description === 'string' ? data.description.trim() : '';

  const created = await prisma.socialLink.create({
    data: {
      title,
      url,
      description,
      coverImageUrl:
        typeof data.coverImageUrl === 'string' && data.coverImageUrl.trim()
          ? data.coverImageUrl.trim()
          : resolveSocialLinkCoverImage(title, url),
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      isNew: typeof data.isNew === 'boolean' ? data.isNew : false,
    },
  });

  // Best-effort: translate title/description to EN & DE for the public /links page.
  translateSocialLinkFields(created.id, title, description).catch(() => {});

  return NextResponse.json(created, { status: 201 });
}
