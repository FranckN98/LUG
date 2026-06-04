import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';
import { prisma } from '@/lib/prisma';
import { resolveSocialLinkCoverImage, seedSocialLinksIfEmpty } from '@/lib/socialLinks';

type SocialLink = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  coverImageUrl: string | null;
};

const copy: Record<Locale, { eyebrow: string; title: string; subtitle: string; empty: string; cta: string }> = {
  de: {
    eyebrow: 'Link Hub',
    title: 'Alle wichtigen Links',
    subtitle: 'Socials, Projekte und Kontaktpunkte an einem Ort.',
    empty: 'Noch keine aktiven Links verfügbar.',
    cta: 'Öffnen',
  },
  en: {
    eyebrow: 'Link hub',
    title: 'All important links',
    subtitle: 'Socials, projects and key touchpoints in one place.',
    empty: 'No active links available yet.',
    cta: 'Open',
  },
  fr: {
    eyebrow: 'Link hub',
    title: 'Tous les liens importants',
    subtitle: 'Réseaux, projets et points de contact au même endroit.',
    empty: 'Aucun lien actif pour le moment.',
    cta: 'Ouvrir',
  },
};

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/links');
}

export default async function LinksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const t = copy[loc];

  let links: SocialLink[] = [];
  try {
    await seedSocialLinksIfEmpty();
    links = await prisma.socialLink.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        url: true,
        description: true,
        coverImageUrl: true,
      },
    });
  } catch {
    links = [];
  }

  return (
    <div className="min-h-screen bg-[#0b0606] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(233,140,11,0.18),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(140,26,26,0.28),transparent_40%)]" />

      <section className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/80">{t.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/70 sm:text-base">{t.subtitle}</p>
        </div>

        {links.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-6 text-center text-sm text-white/60">
            {t.empty}
          </p>
        ) : (
          <ul className="space-y-4">
            {links.map((link) => {
              const cover = link.coverImageUrl?.trim() || resolveSocialLinkCoverImage(link.title, link.url);
              return (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-accent/50 hover:bg-white/[0.06]"
                  >
                    <div className="h-40 w-full overflow-hidden sm:h-48">
                      <img
                        src={cover}
                        alt={link.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6 sm:py-5">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-white">{link.title}</h2>
                        {link.description && <p className="mt-1 text-sm text-white/65">{link.description}</p>}
                      </div>
                      <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                        {t.cta}
                      </span>
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
