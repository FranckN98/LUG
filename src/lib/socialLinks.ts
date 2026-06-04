import { prisma } from '@/lib/prisma';
import { getEmailSocialLinks } from '@/lib/emailSocialLinks';

export async function seedSocialLinksIfEmpty(): Promise<void> {
  const count = await prisma.socialLink.count();
  if (count > 0) return;

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
      sortOrder: item.sortOrder,
      isActive: true,
    })),
  });
}
