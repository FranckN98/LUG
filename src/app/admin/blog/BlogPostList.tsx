'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Post = {
  id: string;
  title: string;
  author: string;
  category: string | null;
  published: boolean;
  createdAt: string;
};

export default function BlogPostList({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function togglePublish(post: Post) {
    setLoading(post.id + '-toggle');
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    });
    setLoading(null);
    router.refresh();
  }

  async function deletePost(id: string) {
    if (!confirm('Supprimer cet article définitivement ?')) return;
    setLoading(id + '-delete');
    await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    setLoading(null);
    router.refresh();
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-10 text-center sm:p-12">
        <p className="text-white/40 text-sm">Aucun article. Créez le premier.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div key={post.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">

          <div className="flex items-start gap-3 sm:gap-4">

          {/* Category dot */}
          <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${post.published ? 'bg-green-400' : 'bg-white/20'}`} />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                post.published
                  ? 'bg-green-500/10 border-green-500/25 text-green-400'
                  : 'bg-white/5 border-white/10 text-white/35'
              }`}>
                {post.published ? 'Publié' : 'Brouillon'}
              </span>
              {post.category && (
                <span className="text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border bg-accent/10 border-accent/20 text-accent/80">
                  {post.category}
                </span>
              )}
            </div>
            <p className="font-semibold text-white text-sm leading-snug mb-1 truncate">{post.title}</p>
            <p className="text-xs text-white/35">{post.author} · {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
          </div>

          {/* Actions */}
          <div className="mt-3 grid grid-cols-1 gap-2 sm:mt-4 sm:grid-cols-3">
            <Link
              href={`/admin/blog/edit/${post.id}`}
              className="flex h-10 items-center justify-center rounded-lg border border-white/10 px-3 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:text-white focus:outline-none"
            >
              Modifier
            </Link>
            <button
              onClick={() => togglePublish(post)}
              disabled={loading === post.id + '-toggle'}
              className={`h-10 rounded-lg border px-3 text-xs font-semibold transition focus:outline-none disabled:opacity-50 ${
                post.published
                  ? 'border-white/10 text-white/45 hover:border-white/20 hover:text-white/70'
                  : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
              }`}
            >
              {loading === post.id + '-toggle' ? '…' : post.published ? 'Dépublier' : 'Publier'}
            </button>
            <button
              onClick={() => deletePost(post.id)}
              disabled={loading === post.id + '-delete'}
              className="h-10 rounded-lg border border-red-500/20 px-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 focus:outline-none disabled:opacity-50"
            >
              {loading === post.id + '-delete' ? '…' : 'Supprimer'}
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}
