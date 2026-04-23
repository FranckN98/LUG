import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import BlogPostList from './BlogPostList';

export default async function AdminBlogPage() {
  let posts: Awaited<ReturnType<typeof prisma.blogPost.findMany>> = [];
  try {
    posts = await prisma.blogPost.findMany({ orderBy: { createdAt: 'desc' } });
  } catch {
    // client not yet regenerated
  }
  const published = posts.filter((p) => p.published).length;

  return (
    <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent/70 mb-1">Contenu</p>
          <h1 className="text-xl font-bold text-white sm:text-2xl">Blog & Impact</h1>
          <p className="mt-1 text-sm leading-relaxed text-white/35">{published} publié{published !== 1 ? 's' : ''} · {posts.length - published} brouillon{posts.length - published !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(140,26,26,0.35)] transition hover:bg-[#a82020] focus:outline-none sm:w-auto sm:py-2.5"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel article
        </Link>
      </div>

      <BlogPostList posts={posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))} />
    </div>
  );
}
