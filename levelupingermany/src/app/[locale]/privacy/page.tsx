import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/config';
import { buildPageMetadata } from '@/lib/seo';
import {
  privacyPolicy,
  type PrivacyBlock,
} from '@/content/privacy-policy';

function Block({ block }: { block: PrivacyBlock }) {
  if (block.type === 'p') {
    return <p className="text-gray-700 leading-relaxed">{block.text}</p>;
  }
  return (
    <ul className="list-disc space-y-2 pl-6 text-gray-700 leading-relaxed">
      {block.items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const doc = privacyPolicy[loc];
  return buildPageMetadata(loc, '/privacy', {
    title: doc.title,
    description: doc.metaDescription,
  });
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'en') as Locale;
  const doc = privacyPolicy[loc];
  const base = `/${loc}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <article className="rounded-2xl border border-gray-100 bg-white/90 p-6 sm:p-10 shadow-sm">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">{doc.title}</h1>
        <p className="text-sm text-gray-500">
          {doc.lastUpdatedLabel} {doc.lastUpdated}
        </p>
        <p className="mt-6 text-gray-700 leading-relaxed border-l-2 border-primary/25 pl-4">{doc.intro}</p>

        {doc.sections.map((section, sIdx) => (
          <section key={section.id} className="mt-10 scroll-mt-24" aria-labelledby={`heading-${section.id}`}>
            <h2
              id={`heading-${section.id}`}
              className="text-xl font-semibold text-brand-dark border-b border-gray-100 pb-2"
            >
              {section.title}
            </h2>
            <div className="mt-4 space-y-4">
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
            {sIdx === 0 && (
              <p className="mt-3">
                <Link
                  href={`${base}/imprint`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  {doc.impressumLinkLabel}
                  <span aria-hidden>→</span>
                </Link>
              </p>
            )}
          </section>
        ))}
      </article>
    </div>
  );
}
