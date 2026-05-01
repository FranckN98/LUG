import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { RevealOnScroll } from '@/components/RevealOnScroll';
import { getBlogCoverImageSrc } from '@/lib/blogCoverImage';
import { generateMetadataForPath } from '@/lib/seo';
import { prisma } from '@/lib/prisma';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/blog-impact');
}

const content: Record<Locale, {
  eyebrow: string; title: string; intro: string;
  comingSoon: string; comingSoonBody: string;
  statsLabel: string;
  stats: { value: string; label: string }[];
  readMore: string; draft: string;
}> = {
  de: {
    eyebrow: 'Stories & Wirkung',
    title: 'Blog & Impact',
    intro: 'Erfahrungen, Ressourcen und der messbare Einfluss unserer Community auf die Diaspora in Deutschland.',
    comingSoon: 'Bald verfügbar',
    comingSoonBody: 'Unsere ersten Artikel und Impact-Berichte sind in Vorbereitung. Folgen Sie uns, um als Erste informiert zu werden.',
    statsLabel: 'Unsere Wirkung bisher',
    stats: [
      { value: '300+', label: 'Teilnehmer:innen 2025' },
      { value: '10+', label: 'Partner & Sponsoren' },
      { value: '1', label: 'Mega Konferenz' },
    ],
    readMore: 'Weiterlesen',
    draft: 'Entwurf',
  },
  en: {
    eyebrow: 'Stories & Impact',
    title: 'Blog & Impact',
    intro: 'Experiences, resources and the measurable influence of our community on the diaspora in Germany.',
    comingSoon: 'Coming soon',
    comingSoonBody: 'Our first articles and impact reports are being prepared. Follow us to be the first to know.',
    statsLabel: 'Our impact so far',
    stats: [
      { value: '300+', label: 'Attendees in 2025' },
      { value: '10+', label: 'Partners & Sponsors' },
      { value: '1', label: 'Mega Conference' },
    ],
    readMore: 'Read more',
    draft: 'Draft',
  },
  fr: {
    eyebrow: 'Récits & Impact',
    title: 'Blog & Impact',
    intro: 'Témoignages, ressources et l\'influence mesurable de notre communauté sur la diaspora en Allemagne.',
    comingSoon: 'Bientôt disponible',
    comingSoonBody: 'Nos premiers articles et rapports d\'impact sont en préparation. Suivez-nous pour être les premiers informés.',
    statsLabel: 'Notre impact jusqu\'ici',
    stats: [
      { value: '300+', label: 'Participants en 2025' },
      { value: '10+', label: 'Partenaires & Sponsors' },
      { value: '1', label: 'Méga Conférence' },
    ],
    readMore: 'Lire la suite',
    draft: 'Brouillon',
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  'Événements': 'bg-primary/10 text-primary border-primary/20',
  'Events':     'bg-primary/10 text-primary border-primary/20',
  'Carrière':   'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Career':     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Impact':     'bg-accent/10 text-accent border-accent/20',
  'Intégration':'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Integration':'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'Études':     'bg-green-500/10 text-green-400 border-green-500/20',
  'Entrepreneuriat': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
};

export default async function BlogImpactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const t = content[loc];

  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  try {
    const now = new Date();
    posts = await prisma.blogPost.findMany({
      where: {
        published: true,
        OR: [
          { publishedAt: null },
          { publishedAt: { lte: now } },
        ],
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
  } catch {
    // blogPost model not yet available — show coming soon
  }

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark" />
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_30%,rgba(233,140,11,0.22),transparent_50%)]" />
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_85%_80%,rgba(140,26,26,0.5),transparent_45%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)`, backgroundSize: '64px 64px' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20 pt-24 sm:pt-28 w-full">
          <RevealOnScroll>
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-accent mb-4">{t.eyebrow}</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white font-display leading-[1.02] max-w-3xl">{t.title}</h1>
            <p className="mt-5 text-base sm:text-lg text-white/65 max-w-xl leading-relaxed">{t.intro}</p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-primary to-primary-dark" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <RevealOnScroll>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-accent/80 mb-10">{t.statsLabel}</p>
          </RevealOnScroll>
          <div className="grid grid-cols-3 gap-6">
            {t.stats.map((s, i) => (
              <RevealOnScroll key={i} delayMs={i * 80}>
                <div className="text-center">
                  <p className="text-4xl sm:text-5xl font-display font-bold text-white">{s.value}</p>
                  <p className="mt-2 text-sm text-white/60 uppercase tracking-wider">{s.label}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARTICLES ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          {posts.length === 0 ? (
            /* Coming soon si aucun article publié */
            <div className="relative py-24 text-center rounded-3xl overflow-hidden bg-[#0d0806]">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(233,140,11,0.12),transparent)]" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-accent mb-8">
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  {t.comingSoon}
                </div>
                <p className="text-base sm:text-lg text-white/55 leading-relaxed max-w-xl mx-auto px-4">
                  {t.comingSoonBody}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, i) => {
                const excerpt = post.body.replace(/\*\*/g, '').slice(0, 160) + '…';
                const catColor = post.category ? (CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-500 border-gray-200') : '';
                const coverImageSrc = getBlogCoverImageSrc(post.coverImage);
                return (
                  <RevealOnScroll key={post.id} delayMs={i * 80}>
                    <Link
                      href={`/${loc}/blog-impact/${post.id}`}
                      className="group flex flex-col h-full rounded-2xl border border-gray-100 bg-white shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_48px_-12px_rgba(140,26,26,0.12)] hover:-translate-y-1.5 hover:border-primary/15 transition-all duration-300 overflow-hidden"
                    >
                      {/* Cover */}
                      <div className="relative h-44 bg-gradient-to-br from-[#1a0808] to-[#2c1010] overflow-hidden">
                        {coverImageSrc ? (
                          <img src={coverImageSrc} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center opacity-10">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                        )}
                        {post.category && (
                          <span className={`absolute top-3 left-3 text-[0.6rem] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${catColor}`}>
                            {post.category}
                          </span>
                        )}
                      </div>

                      {/* Body */}
                      <div className="flex flex-col flex-1 p-6">
                        <h2 className="font-display font-bold text-brand-dark text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3">{excerpt}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            {post.author} · {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                          <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            {t.readMore} →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </RevealOnScroll>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}
