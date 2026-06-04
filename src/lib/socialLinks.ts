import { prisma } from '@/lib/prisma';
import { getEmailSocialLinks } from '@/lib/emailSocialLinks';

export function resolveSocialLinkCoverImage(title: string, url: string): string {
  const key = `${title} ${url}`.toLowerCase();

  if (key.includes('instagram')) return '/hero/hero-2.png';
  if (key.includes('tiktok')) return '/hero/hero-2.png';
  if (key.includes('youtube') || key.includes('youtu.be')) return '/hero/hero-3.png';
  if (key.includes('linkedin')) return '/hero/hero-3.png';
  if (key.includes('whatsapp')) return '/hero/hero-1.png';
  if (key.includes('mailto:') || key.includes('@')) return '/logo_neu.png';

  return '/hero/hero-1.png';
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
    return;
  }

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
