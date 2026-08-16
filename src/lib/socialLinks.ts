import { prisma } from '@/lib/prisma';
import { getEmailSocialLinks } from '@/lib/emailSocialLinks';
import { translateRecord, type TranslatableLocale } from '@/lib/translateText';

const SOURCE_LOCALE: TranslatableLocale = 'fr';
const TARGET_LOCALES: TranslatableLocale[] = ['en', 'de'];

/**
 * Translate a manual link's title/description into the other two site
 * locales and upsert them into SocialLinkTranslation. Assumes admins type
 * content in French (the site's primary editing language). Best-effort: a
 * translation provider failure never blocks the save.
 */
export async function translateSocialLinkFields(
  socialLinkId: string,
  title: string,
  description: string,
): Promise<void> {
  await Promise.all(
    TARGET_LOCALES.map(async (target) => {
      try {
        const { values } = await translateRecord({ title, description }, { source: SOURCE_LOCALE, target });
        await prisma.socialLinkTranslation.upsert({
          where: { socialLinkId_locale: { socialLinkId, locale: target } },
          create: { socialLinkId, locale: target, title: values.title || title, description: values.description ?? '' },
          update: { title: values.title || title, description: values.description ?? '' },
        });
      } catch (error) {
        console.error(`Social link translation (${target}) failed:`, error);
      }
    }),
  );
}

/** Pick the localized title/description for a link, falling back to the source fields. */
export function localizeSocialLink<T extends { title: string; description: string | null }>(
  link: T,
  translations: Array<{ locale: string; title: string; description: string | null }>,
  locale: string,
): { title: string; description: string | null } {
  if (locale === SOURCE_LOCALE) return { title: link.title, description: link.description };
  const match = translations.find((t) => t.locale === locale);
  if (!match || !match.title.trim()) return { title: link.title, description: link.description };
  return { title: match.title, description: match.description };
}


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

function normalizeSocialKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function matchesFeaturedPlatform(title: string, url: string, platform: string): boolean {
  const haystack = normalizeSocialKey(`${title} ${url}`);
  const key = normalizeSocialKey(platform);

  if (key === 'instagram') return haystack.includes('instagram') || haystack.includes('insta');
  if (key === 'linkedin') return haystack.includes('linkedin') || haystack.includes('linkedin');
  if (key === 'tiktok') return haystack.includes('tiktok');
  if (key === 'facebook') return haystack.includes('facebook') || haystack.includes('fb');
  if (key === 'youtube') return haystack.includes('youtube') || haystack.includes('youtu');
  return haystack.includes(key);
}

export async function ensureFeaturedSocialLinks(): Promise<void> {
  const existingLinks = await prisma.socialLink.findMany({
    select: { id: true, title: true, url: true, isActive: true, isFeatured: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  // Backfill: promote the best existing match for each platform to isFeatured=true.
  // This only runs once per link (idempotent) and never touches already-flagged links,
  // so manual links that merely contain a platform keyword are never swept in here.
  for (const featured of FEATURED_SOCIAL_LINKS) {
    const alreadyFeatured = existingLinks.some(
      (link) => link.isFeatured && matchesFeaturedPlatform(link.title, link.url, featured.title),
    );
    if (alreadyFeatured) continue;

    // Prefer an exact platform-name match (e.g. title === "YouTube") over a
    // loose keyword match, so a manual link that happens to mention the
    // platform never gets picked ahead of the real channel link.
    const exactMatch = existingLinks.find(
      (link) =>
        !link.isFeatured &&
        normalizeSocialKey(link.title) === normalizeSocialKey(featured.title) &&
        link.isActive &&
        link.url.trim(),
    );
    const candidate =
      exactMatch ??
      existingLinks.find(
        (link) =>
          !link.isFeatured &&
          matchesFeaturedPlatform(link.title, link.url, featured.title) &&
          link.isActive &&
          link.url.trim(),
      );
    if (candidate) {
      await prisma.socialLink.update({ where: { id: candidate.id }, data: { isFeatured: true } });
      candidate.isFeatured = true;
    }
  }

  const missingFeaturedLinks = FEATURED_SOCIAL_LINKS.filter(
    (featured) =>
      !existingLinks.some(
        (link) => link.isFeatured && matchesFeaturedPlatform(link.title, link.url, featured.title),
      ),
  );

  if (missingFeaturedLinks.length === 0) return;

  const highestOrder = await prisma.socialLink.aggregate({ _max: { sortOrder: true } });
  const firstOrder = (highestOrder._max.sortOrder ?? -1) + 1;

  await prisma.socialLink.createMany({
    data: missingFeaturedLinks.map((link, index) => ({
      title: link.title,
      url: link.url,
      description: '',
      coverImageUrl: resolveSocialLinkCoverImage(link.title, link.url),
      sortOrder: firstOrder + index,
      isActive: true,
      isNew: false,
      isFeatured: true,
    })),
  });
}

export async function resetFeaturedSocialLinksToDefaults(): Promise<void> {
  await ensureFeaturedSocialLinks();

  const featuredLinks = await prisma.socialLink.findMany({ where: { isFeatured: true } });

  for (const defaults of FEATURED_SOCIAL_LINKS) {
    const link = featuredLinks.find((item) => matchesFeaturedPlatform(item.title, item.url, defaults.title));
    if (!link) continue;

    await prisma.socialLink.update({
      where: { id: link.id },
      data: {
        title: defaults.title,
        url: defaults.url,
        isActive: true,
        coverImageUrl: resolveSocialLinkCoverImage(defaults.title, defaults.url),
      },
    });
  }
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

    await ensureFeaturedSocialLinks();
    return;
  }

  const social = await getEmailSocialLinks();

  const seeds = [
    { title: 'Website', url: social.website, description: 'Site officiel', sortOrder: 0, isFeatured: false },
    { title: 'LinkedIn', url: social.linkedin, description: 'Actualités & réseau pro', sortOrder: 1, isFeatured: true },
    { title: 'Instagram', url: social.instagram, description: 'Contenu visuel & coulisses', sortOrder: 2, isFeatured: true },
    { title: 'TikTok', url: social.tiktok, description: 'Vidéos courtes', sortOrder: 3, isFeatured: true },
    { title: 'YouTube', url: social.youtube, description: 'Vidéos & replays', sortOrder: 4, isFeatured: true },
    { title: 'Facebook', url: 'https://www.facebook.com/levelupingermany', description: 'Actualités de la communauté', sortOrder: 5, isFeatured: true },
    { title: 'WhatsApp', url: social.whatsapp, description: 'Canal communauté', sortOrder: 6, isFeatured: false },
    {
      title: 'Contact Email',
      url: social.email ? `mailto:${social.email}` : '',
      description: 'Nous contacter directement',
      sortOrder: 7,
      isFeatured: false,
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
      isFeatured: item.isFeatured,
    })),
  });

  await ensureFeaturedSocialLinks();
}
