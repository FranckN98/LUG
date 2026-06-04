import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/adminAuth';
import { getEmailSocialLinks } from '@/lib/emailSocialLinks';

function parseUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value) return null;
  if (value.startsWith('/')) return value;
  if (value.startsWith('mailto:') || value.startsWith('tel:')) return value;
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return value;
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  const unauthorized = requireAdmin();
  if (unauthorized) return unauthorized;

  const count = await prisma.socialLink.count();
  if (count === 0) {
    const social = await getEmailSocialLinks();

    const seeds = [
      { title: 'Website', url: social.website, description: 'Site officiel', sortOrder: 0 },
      { title: 'LinkedIn', url: social.linkedin, description: 'Actualités & réseau pro', sortOrder: 1 },
      { title: 'Instagram', url: social.instagram, description: 'Contenu visuel & coulisses', sortOrder: 2 },
      { title: 'TikTok', url: social.tiktok, description: 'Vidéos courtes', sortOrder: 3 },
      { title: 'YouTube', url: social.youtube, description: 'Vidéos & replays', sortOrder: 4 },
      { title: 'WhatsApp', url: social.whatsapp, description: 'Canal communauté', sortOrder: 5 },
      {
        title: 'Contact Email',
        url: social.email ? `mailto:${social.email}` : '',
        description: 'Nous contacter directement',
        sortOrder: 6,
      },
    ].filter((item) => item.url.trim());

    const dedup = new Set<string>();
    const data = seeds.filter((item) => {
      const key = item.url.trim().toLowerCase();
      if (dedup.has(key)) return false;
      dedup.add(key);
      return true;
    });

    if (data.length > 0) {
      await prisma.socialLink.createMany({
        data: data.map((item) => ({
          title: item.title,
          url: item.url.trim(),
          description: item.description,
          sortOrder: item.sortOrder,
          isActive: true,
        })),
      });
    }
  }

  const links = await prisma.socialLink.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
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

  const created = await prisma.socialLink.create({
    data: {
      title,
      url,
      description: typeof data.description === 'string' ? data.description.trim() : '',
      coverImageUrl:
        typeof data.coverImageUrl === 'string' && data.coverImageUrl.trim()
          ? data.coverImageUrl.trim()
          : null,
      sortOrder: typeof data.sortOrder === 'number' ? data.sortOrder : 0,
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
