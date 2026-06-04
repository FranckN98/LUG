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
    <div className="relative min-h-screen bg-[#f4f1eb] dark:bg-[#0b0606] text-[#1a1a1a] dark:text-white">
      {/* Paper texture background — layered radial gradients matching site-wide design */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {/* Base warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#faf8f4] via-[#f4f1eb] to-[#ebe6dd] dark:from-[#0b0606] dark:via-[#0b0606] dark:to-[#0b0606]" />
        
        {/* Top highlight ellipse */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[250%] h-[200%] -top-1/4
          bg-[radial-gradient(ellipse_130%_85%_at_50%_-25%,rgba(255,255,255,0.72)_0%,transparent_58%)]
          dark:bg-[radial-gradient(circle_at_20%_20%,rgba(233,140,11,0.12),transparent_45%)]" />
        
        {/* Left shadow ellipse */}
        <div className="absolute top-1/3 left-0 w-[180%] h-[140%]
          bg-[radial-gradient(ellipse_70%_55%_at_12%_38%,rgba(0,0,0,0.035)_0%,transparent_52%)]
          dark:bg-[radial-gradient(circle_at_20%_20%,rgba(233,140,11,0.15),transparent_45%)]" />
        
        {/* Right shadow ellipse */}
        <div className="absolute -top-1/4 right-0 w-[150%] h-[160%]
          bg-[radial-gradient(ellipse_55%_45%_at_88%_72%,rgba(0,0,0,0.028)_0%,transparent_50%)]
          dark:bg-[radial-gradient(circle_at_80%_80%,rgba(140,26,26,0.18),transparent_40%)]" />
      </div>

      <section className="relative mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20 z-10">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/80">{t.eyebrow}</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">{t.title}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#1a1a1a]/70 dark:text-white/70 sm:text-base">{t.subtitle}</p>
        </div>

        {links.length === 0 ? (
          <p className="rounded-2xl border border-[#1a1a1a]/10 bg-white/75 px-5 py-6 text-center text-sm text-[#1a1a1a]/60 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/60">
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
                    className="group flex items-center gap-3 overflow-hidden rounded-2xl border border-[#1a1a1a]/10 bg-white/75 p-3 transition-all hover:border-accent/50 hover:bg-white/90 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] sm:gap-4 sm:p-4"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#1a1a1a]/10 dark:border-white/10 sm:h-24 sm:w-24">
                      <img
                        src={cover}
                        alt={link.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-[#1a1a1a] dark:text-white">{link.title}</h2>
                        {link.description && <p className="mt-1 text-sm text-[#1a1a1a]/65 dark:text-white/65">{link.description}</p>}
                        <p className="mt-1 truncate text-xs text-[#1a1a1a]/45 dark:text-white/40">{link.url.replace(/^mailto:/, '')}</p>
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
