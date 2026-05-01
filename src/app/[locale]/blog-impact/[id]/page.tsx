import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { getBlogCoverImageSrc } from '@/lib/blogCoverImage';
import { prisma } from '@/lib/prisma';
import { BlogPostActions } from '@/components/BlogPostActions';
import { formatReadingTime } from '@/lib/readingTime';

const backLabel: Record<Locale, string> = {
  fr: '← Retour au Blog',
  en: '← Back to Blog',
  de: '← Zurück zum Blog',
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post || !post.published) notFound();
  // Hide scheduled future posts from the public
  if (post.publishedAt && post.publishedAt.getTime() > Date.now()) notFound();

  const paragraphs = post.body.split('\n').filter(Boolean);
  const coverImageSrc = getBlogCoverImageSrc(post.coverImage);

  // Render **bold** segments inline. Splits on `**...**` while keeping the matched
  // groups so we can wrap them in <strong>. Unmatched `**` are left as-is.
  function renderInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={i} className="font-semibold text-brand-dark">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  // A line is a heading only if the WHOLE line is wrapped in a single pair of `**`
  // (no other bold markers inside).
  function isHeadingLine(p: string) {
    if (!p.startsWith('**') || !p.endsWith('**') || p.length <= 4) return false;
    const inner = p.slice(2, -2);
    return !inner.includes('**');
  }

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-[42vh] flex items-end overflow-hidden">
        {coverImageSrc ? (
          <>
            <img src={coverImageSrc} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0505] via-[#0d050580] to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#110808] via-[#1f0d0d] to-brand-dark" />
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_20%_30%,rgba(233,140,11,0.22),transparent_50%)]" />
          </>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 pt-24 sm:pt-28 w-full">
          {post.category && (
            <span className="inline-block mb-4 text-[0.6rem] font-bold uppercase tracking-[0.3em] px-3 py-1 rounded-full border border-accent/40 text-accent bg-accent/10">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display leading-tight max-w-3xl">
            {post.title}
          </h1>
          <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/50">
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <span>{new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatReadingTime(post.body, loc)}
            </span>
          </p>
        </div>
      </section>

      {/* ── CONTENT ── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          <Link
            href={`/${loc}/blog-impact`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary mb-10 hover:opacity-75 transition"
          >
            {backLabel[loc]}
          </Link>

          <div className="prose prose-gray max-w-none">
            {paragraphs.map((p, i) => {
              const img = p.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
              if (img) {
                // eslint-disable-next-line @next/next/no-img-element
                return (
                  <img
                    key={i}
                    src={img[2]}
                    alt={img[1]}
                    className="my-6 w-full rounded-xl border border-gray-200"
                    loading="lazy"
                  />
                );
              }
              if (isHeadingLine(p)) {
                return <h3 key={i} className="text-lg font-bold text-brand-dark mt-8 mb-3">{p.slice(2, -2)}</h3>;
              }
              if (p.startsWith('- ')) {
                return <li key={i} className="text-gray-600 leading-relaxed ml-4">{renderInline(p.slice(2))}</li>;
              }
              return <p key={i} className="text-gray-600 leading-relaxed mb-4">{renderInline(p)}</p>;
            })}
          </div>

          <BlogPostActions
            postId={post.id}
            postTitle={post.title}
            initialLikes={post.likes}
            initialShares={post.shares}
            locale={loc}
          />

          <div className="mt-12 pt-8 border-t border-gray-100">
            <Link
              href={`/${loc}/blog-impact`}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary hover:text-white hover:border-primary transition"
            >
              {backLabel[loc]}
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
