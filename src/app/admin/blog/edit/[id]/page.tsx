'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import BlogPostForm, {
  type BlogPostFormValues,
  type BlogTranslationFormValues,
} from '../../BlogPostForm';

const LOCALES: Locale[] = ['fr', 'en', 'de'];
const EMPTY_TR: BlogTranslationFormValues = {
  title: '',
  excerpt: '',
  body: '',
  metaTitle: '',
  metaDescription: '',
};

type TranslationRow = {
  locale: string;
  title: string;
  excerpt: string | null;
  body: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

type ApiPost = {
  id: string;
  title?: string;
  body?: string;
  author?: string;
  category?: string | null;
  coverImage?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  translations?: TranslationRow[];
};

export default function EditBlogPostPage() {
  const params = useParams();
  const id = params.id as string;
  const [initial, setInitial] = useState<BlogPostFormValues | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((post: ApiPost) => {
        let publishedAtLocal = '';
        if (post.publishedAt) {
          const d = new Date(post.publishedAt);
          if (!Number.isNaN(d.getTime())) {
            const pad = (n: number) => String(n).padStart(2, '0');
            publishedAtLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          }
        }
        const translations: Record<Locale, BlogTranslationFormValues> = {
          fr: { ...EMPTY_TR },
          en: { ...EMPTY_TR },
          de: { ...EMPTY_TR },
        };
        for (const l of LOCALES) {
          const t = post.translations?.find((x) => x.locale === l);
          if (t) {
            translations[l] = {
              title: t.title ?? '',
              excerpt: t.excerpt ?? '',
              body: t.body ?? '',
              metaTitle: t.metaTitle ?? '',
              metaDescription: t.metaDescription ?? '',
            };
          }
        }
        // Legacy fallback: if no translations exist at all, seed FR from legacy fields.
        const anyFilled = LOCALES.some((l) => translations[l].title || translations[l].body);
        if (!anyFilled && (post.title || post.body)) {
          translations.fr = {
            ...EMPTY_TR,
            title: post.title ?? '',
            body: post.body ?? '',
          };
        }
        setInitial({
          author: post.author ?? '',
          category: post.category ?? '',
          coverImage: post.coverImage ?? '',
          published: post.published ?? false,
          publishedAt: publishedAtLocal,
          translations,
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
