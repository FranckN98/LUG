'use client';

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
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-12 text-center">
        <p className="text-white/40 text-sm">Aucun article. Créez le premier.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div key={post.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 flex items-start gap-4">

          {/* Category dot */}
          <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${post.published ? 'bg-green-400' : 'bg-white/20'}`} />

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

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => togglePublish(post)}
              disabled={loading === post.id + '-toggle'}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition focus:outline-none disabled:opacity-50 ${
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
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition focus:outline-none disabled:opacity-50"
            >
              {loading === post.id + '-delete' ? '…' : 'Supprimer'}
            </button>
          </div>

        </div>
      ))}
    </div>
  );
}
