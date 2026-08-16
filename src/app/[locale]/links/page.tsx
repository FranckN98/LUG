import type { Locale } from '@/i18n/config';
import Link from 'next/link';
import { generateMetadataForPath } from '@/lib/seo';
import { prisma } from '@/lib/prisma';
import { resolveSocialLinkCoverImage, seedSocialLinksIfEmpty, localizeSocialLink } from '@/lib/socialLinks';

type SocialLink = {
  id: string;
  title: string;
  url: string;
  description: string | null;
  coverImageUrl: string | null;
  isNew: boolean;
  isFeatured: boolean;
  translations: Array<{ locale: string; title: string; description: string | null }>;
};

const FEATURED_SOCIALS = [
  { name: 'TikTok' },
  { name: 'Instagram' },
  { name: 'LinkedIn' },
  { name: 'Facebook' },
  { name: 'YouTube' },
] as const;

function BrandIcon({ name }: { name: string }) {
  const commonClassName = 'h-7 w-7 md:h-9 md:w-9';

  switch (name) {
    case 'TikTok':
      return (
        <svg viewBox="0 0 64 64" className={commonClassName} aria-hidden>
          <circle cx="32" cy="32" r="26" fill="#000000" />
          <g transform="translate(6,6) scale(2.1667)">
            <path
              transform="translate(-1.1,-0.9)"
              fill="#25F4EE"
              d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
            />
            <path
              transform="translate(1.1,0.9)"
              fill="#FE2C55"
              d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
            />
            <path
              fill="#ffffff"
              d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
            />
          </g>
        </svg>
      );
    case 'Instagram':
      return (
        <svg viewBox="0 0 64 64" className={commonClassName} aria-hidden>
          <circle cx="32" cy="32" r="25" fill="url(#instaGradient)" />
          <rect x="18" y="18" width="28" height="28" rx="8" fill="none" stroke="#ffffff" strokeWidth="3.2" />
          <circle cx="32" cy="32" r="7.5" fill="none" stroke="#ffffff" strokeWidth="3.2" />
          <circle cx="41.5" cy="22.5" r="2.3" fill="#ffffff" />
          <defs>
            <linearGradient id="instaGradient" x1="8" y1="10" x2="56" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f9ce34" />
              <stop offset="0.35" stopColor="#ee2a7b" />
              <stop offset="0.7" stopColor="#6228d7" />
              <stop offset="1" stopColor="#1f8fff" />
            </linearGradient>
          </defs>
        </svg>
      );
    case 'LinkedIn':
      return (
        <svg viewBox="0 0 64 64" className={commonClassName} aria-hidden>
          <circle cx="32" cy="32" r="26" fill="#0A66C2" />
          <path d="M17 24.5h7.1v19.5H17V24.5Zm3.5-10.2a4.1 4.1 0 1 1 0 8.2 4.1 4.1 0 0 1 0-8.2ZM27.8 24.5h6.8v2.6h.1c1-1.8 3.2-3.7 6.7-3.7 7.1 0 8.4 4.6 8.4 10.7v10H43v-9.4c0-2.3-.1-5.2-3.3-5.2-3.3 0-3.8 2.6-3.8 5.2v9.4h-6.9V24.5Z" fill="#ffffff" />
        </svg>
      );
    case 'Facebook':
      return (
        <svg viewBox="0 0 64 64" className={commonClassName} aria-hidden>
          <circle cx="32" cy="32" r="26" fill="#1877f2" />
          <path d="M35.6 22.3h5.2V13h-6.2c-7.7 0-9.1 4.9-9.1 9.4v4H20v9.3h5.5V52h9.9V35.7h7.1l1.2-9.3h-8.3v-4c0-1.6.8-3.1 3.1-3.1Z" fill="#ffffff" />
        </svg>
      );
    case 'YouTube':
      return (
        <svg viewBox="0 0 64 64" className={commonClassName} aria-hidden>
          <circle cx="32" cy="32" r="26" fill="#ff0000" />
          <path d="m27 24 16 8-16 8V24Z" fill="#ffffff" />
        </svg>
      );
    default:
      return null;
  }
}

function normalizeSocialKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

// Only ever called on links already flagged isFeatured=true, to pick which of
// the 5 platform slots a given featured record belongs to.
function matchesPlatformSlot(link: SocialLink, name: string): boolean {
  const key = normalizeSocialKey(`${link.title} ${link.url}`);
  const platform = normalizeSocialKey(name);

  if (platform === 'facebook') return key.includes('facebook') || key.includes('fb');
  if (platform === 'instagram') return key.includes('instagram') || key.includes('insta');
  if (platform === 'linkedin') return key.includes('linkedin');
  if (platform === 'youtube') return key.includes('youtube') || key.includes('youtu');
  if (platform === 'tiktok') return key.includes('tiktok');
  return key.includes(platform);
}

const copy: Record<Locale, { eyebrow: string; tagline: string; title: string; subtitle: string; empty: string; cta: string; newBadge: string }> = {
  de: {
    eyebrow: 'Willkommen',
    tagline: 'Unser ganzes Universum, an einem Ort ✨',
    title: 'Schön, dich hier zu sehen 👋',
    subtitle:
      'Hier findest du alle Wege, mit unserer Community in Verbindung zu bleiben — Socials, Ressourcen und Projekte. Folge uns, schreib uns oder klick rein, wo es dich neugierig macht.',
    empty: 'Bald gibt es hier neue Links zu entdecken.',
    cta: 'Öffnen',
    newBadge: 'Neu',
  },
  en: {
    eyebrow: 'Welcome',
    tagline: 'Our whole universe, in one place ✨',
    title: 'So glad you stopped by 👋',
    subtitle:
      'All the ways to stay connected with our community in one place — socials, resources and projects. Follow along, reach out, or just explore whatever sparks your curiosity.',
    empty: 'New links are coming soon — stay tuned.',
    cta: 'Open',
    newBadge: 'New',
  },
  fr: {
    eyebrow: 'Bienvenue',
    tagline: 'Tout notre univers, en un seul endroit ✨',
    title: 'Heureux de te voir ici 👋',
    subtitle:
      'Tous les moyens de rester connecté à notre communauté en un seul endroit — réseaux, ressources et projets. Suis-nous, écris-nous, ou explore simplement ce qui éveille ta curiosité.',
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
        isFeatured: true,
        translations: { select: { locale: true, title: true, description: true } },
      },
    });
  } catch {
    links = [];
  }

  const featuredLinks = FEATURED_SOCIALS.flatMap((social) => {
    const link = links.find((item) => item.isFeatured && matchesPlatformSlot(item, social.name));
    return link ? [{ ...social, link }] : [];
  });
  const featuredIds = new Set(featuredLinks.map((social) => social.link.id));
  const contentLinks = links
    .filter((link) => !featuredIds.has(link.id))
    .map((link) => ({ ...link, ...localizeSocialLink(link, link.translations, loc) }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0606] text-white">
      {/* Hide the global site header on this landing-style page only */}
      <style>{`header.fixed{display:none!important}main{padding-top:0!important}`}</style>

      {/* Home button (top-right) */}
      <Link
        href={`/${loc}`}
        aria-label="Home"
        className="group fixed right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 backdrop-blur-md transition-all hover:border-accent/60 hover:bg-accent/15 hover:text-accent sm:right-6 sm:top-6 sm:h-11 sm:w-11"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 transition-transform group-hover:-translate-y-0.5"
        >
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v10h14V10" />
          <path d="M10 20v-6h4v6" />
        </svg>
      </Link>

      {/* Ambient background — warm glow on dark */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#120808] via-[#0b0606] to-[#070303]" />
        <div className="absolute -top-1/3 left-1/2 h-[80vh] w-[120vw] -translate-x-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(233,140,11,0.18),transparent_70%)]" />
        <div className="absolute bottom-[-30%] right-[-10%] h-[70vh] w-[80vw] bg-[radial-gradient(circle_at_70%_70%,rgba(140,26,26,0.22),transparent_65%)]" />
        <div className="absolute top-1/3 left-[-10%] h-[60vh] w-[60vw] bg-[radial-gradient(circle_at_30%_50%,rgba(233,140,11,0.08),transparent_60%)]" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero / welcome */}
        <header className="relative mb-12 flex flex-col items-center text-center">
          {/* Avatar with glow halo */}
          <div className="relative mb-6">
            <div
              aria-hidden
              className="absolute -inset-6 rounded-full bg-[radial-gradient(circle_at_center,rgba(233,140,11,0.45),transparent_70%)] blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent via-[#C0392B] to-[#8C1A1A] opacity-90 blur-[2px]"
            />
            <div className="relative grid h-[7.69rem] w-[7.69rem] place-items-center overflow-hidden rounded-full border border-white/20 bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] sm:h-[8.96rem] sm:w-[8.96rem]">
              <img
                src="/logo.png"
                alt="Level Up in Germany"
                className="h-[95%] w-[95%] object-contain"
              />
            </div>
          </div>

          {/* Verified handle */}
          <div className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/90">
            <span>@levelupingermany</span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4 text-accent"
              fill="currentColor"
            >
              <path d="M12 2l2.39 2.39 3.39-.05.06 3.39L20.24 10 17.84 12l2.4 2-2.4 2.27.05 3.39-3.39.06L12 22l-2.39-2.28-3.39.05-.06-3.39L3.76 14l2.4-2-2.4-2 2.4-2.27-.05-3.39 3.39-.06L12 2zm-1.18 13.07l5.6-5.6-1.41-1.41-4.19 4.18-1.8-1.79-1.41 1.41 3.21 3.21z" />
            </svg>
          </div>

          {/* Eyebrow */}
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.4em] text-accent/90">{t.eyebrow}</p>

          {/* Tagline */}
          <p className="mt-2 font-display text-xl italic tracking-tight text-white sm:text-2xl">{t.tagline}</p>
        </header>

        {featuredLinks.length > 0 && (
          <nav aria-label="Réseaux sociaux" className="mb-8">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {featuredLinks.map(({ name, link }) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  title={name}
                  className="group relative flex aspect-square min-w-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] shadow-[0_18px_35px_-20px_rgba(0,0,0,0.9)] transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_22px_40px_-18px_rgba(233,140,11,0.8)]"
                >
                  <span className="relative z-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <BrandIcon name={name} />
                  </span>
                  <span className="sr-only">{name}</span>
                </a>
              ))}
            </div>
          </nav>
        )}

        {links.length === 0 ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-8 text-center text-sm text-white/60">
            {t.empty}
          </p>
        ) : contentLinks.length > 0 ? (
          <ul className="space-y-3">
            {contentLinks.map((link) => {
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
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#25D366]/50 bg-[#25D366]/15 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.15em] text-[#25D366] shadow-[0_0_12px_-2px_rgba(37,211,102,0.55)]">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#25D366]" />
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
        ) : null}
      </section>
    </div>
  );
}
