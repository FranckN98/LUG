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
  isNew: boolean;
};

const copy: Record<Locale, { eyebrow: string; title: string; subtitle: string; empty: string; cta: string; newBadge: string }> = {
  de: {
    eyebrow: 'Willkommen',
    title: 'Schön, dich hier zu sehen 👋',
    subtitle:
      'Hier findest du alle Wege, mit unserer Community in Verbindung zu bleiben — Socials, Ressourcen und Projekte. Folge uns, schreib uns oder klick rein, wo es dich neugierig macht.',
    empty: 'Bald gibt es hier neue Links zu entdecken.',
    cta: 'Öffnen',
    newBadge: 'Neu',
  },
  en: {
    eyebrow: 'Welcome',
    title: 'So glad you stopped by 👋',
    subtitle:
      'All the ways to stay connected with our community in one place — socials, resources and projects. Follow along, reach out, or just explore whatever sparks your curiosity.',
    empty: 'New links are coming soon — stay tuned.',
    cta: 'Open',
    newBadge: 'New',
  },
  fr: {
    eyebrow: 'Bienvenue',
    title: 'Heureux·se de te voir ici 👋',
    subtitle:
      'Tous les moyens de rester connecté·e à notre communauté en un seul endroit — réseaux, ressources et projets. Suis-nous, écris-nous, ou explore simplement ce qui éveille ta curiosité.',
    empty: 'De nouveaux liens arrivent bientôt — reste à l’écoute.',
    cta: 'Ouvrir',
    newBadge: 'Nouveau',
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
        isNew: true,
      },
    });
  } catch {
    links = [];
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0606] text-white">
      {/* Ambient background — warm glow on dark */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#120808] via-[#0b0606] to-[#070303]" />
        <div className="absolute -top-1/3 left-1/2 h-[80vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(233,140,11,0.18),transparent_70%)]" />
        <div className="absolute bottom-[-30%] right-[-10%] h-[70vh] w-[80vw] bg-[radial-gradient(circle_at_70%_70%,rgba(140,26,26,0.22),transparent_65%)]" />
        <div className="absolute top-1/3 left-[-10%] h-[60vh] w-[60vw] bg-[radial-gradient(circle_at_30%_50%,rgba(233,140,11,0.08),transparent_60%)]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        {/* Hero / welcome */}
        <div className="mb-12 text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-accent">{t.eyebrow}</p>
          <h1 className="mt-4 text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-[3.25rem]">
            {t.title}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-white/70 sm:text-lg">
            {t.subtitle}
          </p>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
        </div>

        {links.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm text-white/60">
            {t.empty}
          </p>
        ) : (
          <ul className="space-y-3">
            {links.map((link) => {
              const cover = link.coverImageUrl?.trim() || resolveSocialLinkCoverImage(link.title, link.url);
              const isHighlighted = link.isNew;
              return (
                <li key={link.id} className="relative">
                  {/* Subtle glow halo for NEW links */}
                  {isHighlighted && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-r from-accent/30 via-accent/10 to-accent/30 opacity-70 blur-md transition-opacity"
                    />
                  )}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-2xl border bg-white/[0.04] p-2.5 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.07] hover:shadow-[0_0_30px_-10px_rgba(233,140,11,0.4)] sm:gap-3.5 sm:p-3 ${
                      isHighlighted
                        ? 'border-accent/40 shadow-[0_0_24px_-12px_rgba(233,140,11,0.55)] hover:border-accent/60'
                        : 'border-white/10 hover:border-accent/40'
                    }`}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0a0505] sm:h-16 sm:w-16">
                      <img
                        src={cover}
                        alt={link.title}
                        className="h-full w-full object-cover opacity-90 transition-all duration-500 group-hover:scale-[1.05] group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-base font-semibold text-white sm:text-lg">{link.title}</h2>
                          {isHighlighted && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/50 bg-accent/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-accent shadow-[0_0_12px_-2px_rgba(233,140,11,0.5)]">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                              {t.newBadge}
                            </span>
                          )}
                        </div>
                        {link.description && <p className="mt-0.5 line-clamp-1 text-xs text-white/65 sm:text-sm">{link.description}</p>}
                        <p className="mt-0.5 truncate text-[0.7rem] text-white/40 sm:text-xs">{link.url.replace(/^mailto:/, '')}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-[#0b0606]">
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
