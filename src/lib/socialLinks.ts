import { prisma } from '@/lib/prisma';
import { getEmailSocialLinks } from '@/lib/emailSocialLinks';

export function resolveSocialLinkCoverImage(title: string, url: string): string {
  const key = `${title} ${url}`.toLowerCase();

  if (key.includes('instagram')) return '/hero/hero-2.png';
  if (key.includes('tiktok')) return '/hero/hero-2.png';
  if (key.includes('youtube') || key.includes('youtu.be')) return '/hero/hero-3.png';
  if (key.includes('linkedin')) return '/hero/hero-3.png';
  if (key.includes('facebook') || key.includes('fb.com')) return '/hero/hero-1.png';
  if (key.includes('whatsapp')) return '/hero/hero-1.png';
  if (key.includes('mailto:') || key.includes('@')) return '/logo_neu.png';

  return '/hero/hero-1.png';
}

const FEATURED_SOCIAL_LINKS = [
  { title: 'TikTok', url: 'https://www.tiktok.com/@levelupingermany' },
  { title: 'Instagram', url: 'https://www.instagram.com/levelupingermany/' },
  { title: 'LinkedIn', url: 'https://www.linkedin.com/company/level-up-in-germany/' },
  { title: 'Facebook', url: 'https://www.facebook.com/levelupingermany' },
  { title: 'YouTube', url: 'https://www.youtube.com/@levelupingermany' },
] as const;

function isFeaturedSocialLink(title: string, url: string, platform: string): boolean {
  const key = `${title} ${url}`.toLowerCase();
  return key.includes(platform.toLowerCase());
}

export async function seedSocialLinksIfEmpty(): Promise<void> {
  const count = await prisma.socialLink.count();
  if (count > 0) {
    const missingCover = await prisma.socialLink.findMany({
      where: {
        OR: [{ coverImageUrl: null }, { coverImageUrl: '' }],
      },
      select: { id: true, title: true, url: true },
    });

    for (const link of missingCover) {
      await prisma.socialLink.update({
        where: { id: link.id },
        data: { coverImageUrl: resolveSocialLinkCoverImage(link.title, link.url) },
      });
    }

    const existingLinks = await prisma.socialLink.findMany({ select: { title: true, url: true } });
    const missingFeaturedLinks = FEATURED_SOCIAL_LINKS.filter(
      (featured) =>
        !existingLinks.some((link) => isFeaturedSocialLink(link.title, link.url, featured.title)),
    );
    if (missingFeaturedLinks.length > 0) {
      const highestOrder = await prisma.socialLink.aggregate({ _max: { sortOrder: true } });
      const firstOrder = (highestOrder._max.sortOrder ?? -1) + 1;
      await prisma.socialLink.createMany({
        data: missingFeaturedLinks.map((link, index) => ({
          ...link,
          description: '',
          coverImageUrl: resolveSocialLinkCoverImage(link.title, link.url),
          sortOrder: firstOrder + index,
          isActive: true,
        })),
      });
    }
    return;
  }

  const social = await getEmailSocialLinks();

  const seeds = [
    { title: 'Website', url: social.website, description: 'Site officiel', sortOrder: 0 },
    { title: 'LinkedIn', url: social.linkedin, description: 'Actualités & réseau pro', sortOrder: 1 },
    { title: 'Instagram', url: social.instagram, description: 'Contenu visuel & coulisses', sortOrder: 2 },
    { title: 'TikTok', url: social.tiktok, description: 'Vidéos courtes', sortOrder: 3 },
    { title: 'YouTube', url: social.youtube, description: 'Vidéos & replays', sortOrder: 4 },
    { title: 'Facebook', url: 'https://www.facebook.com/levelupingermany', description: 'Actualités de la communauté', sortOrder: 5 },
    { title: 'WhatsApp', url: social.whatsapp, description: 'Canal communauté', sortOrder: 6 },
    {
      title: 'Contact Email',
      url: social.email ? `mailto:${social.email}` : '',
      description: 'Nous contacter directement',
      sortOrder: 7,
    },
  ].filter((item) => item.url.trim());

  const dedup = new Set<string>();
  const data = seeds.filter((item) => {
    const key = item.url.trim().toLowerCase();
    if (dedup.has(key)) return false;
    dedup.add(key);
    return true;
  });

  if (data.length === 0) return;

  await prisma.socialLink.createMany({
    data: data.map((item) => ({
      title: item.title,
      url: item.url.trim(),
      description: item.description,
      coverImageUrl: resolveSocialLinkCoverImage(item.title, item.url),
      sortOrder: item.sortOrder,
      isActive: true,
    })),
  });
}
