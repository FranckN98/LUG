import React from 'react';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/blog-impact');
}

const content: Record<Locale, { title: string; intro: string }> = {
  de: { title: 'Blog & Impact', intro: 'Stories, Ressourcen und messbarer Impact unserer Community.' },
  en: { title: 'Blog & Impact', intro: 'Stories, resources and measurable impact of our community.' },
  fr: { title: 'Blog & Impact', intro: 'Histoires, ressources et impact mesurable de notre communaute.' },
};

export default async function BlogImpactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];
  const posts = [
    { title: 'How to build a career in Germany', cat: 'Career' },
    { title: 'Guide to student life in Germany', cat: 'Studies' },
    { title: 'Event recap: Level Up 2025', cat: 'Events' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-4">{t.title}</h1>
      <p className="text-gray-600 mb-8">{t.intro}</p>
      <div className="grid md:grid-cols-3 gap-5">
        {posts.map((p) => (
          <article key={p.title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-accent font-semibold mb-2">{p.cat}</p>
            <h2 className="font-semibold text-primary">{p.title}</h2>
          </article>
        ))}
      </div>
    </div>
  );
}
