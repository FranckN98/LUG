'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import BlogPostForm, { type BlogPostFormValues } from '../../BlogPostForm';

export default function EditBlogPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [initial, setInitial] = useState<BlogPostFormValues | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/admin/blog')
      .then((r) => r.json())
      .then((posts: Array<Partial<BlogPostFormValues> & { id: string }>) => {
        const post = posts.find((p) => p.id === id);
        if (!post) {
          setNotFound(true);
          return;
        }
        setInitial({
          title: post.title ?? '',
          body: post.body ?? '',
          author: post.author ?? '',
          category: post.category ?? '',
          coverImage: post.coverImage ?? '',
          published: post.published ?? false,
        });
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:p-8">
        <p className="text-sm text-white/60 mb-3">Article introuvable.</p>
        <Link href="/admin/blog" className="text-xs font-semibold text-accent hover:underline">← Retour à la liste</Link>
      </div>
    );
  }

  if (!initial) {
    return (
      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:p-8 flex items-center gap-3 text-white/40 text-sm">
        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-accent animate-spin" />
        Chargement…
      </div>
    );
  }

  return <BlogPostForm mode="edit" postId={id} initial={initial} />;
}
