import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/programme');
}

const content: Record<
  Locale,
  { title: string; intro: string; workshops: string; mentoring: string; conference: string }
> = {
  de: {
    title: 'Programm',
    intro: 'Workshops, Mentoring und unsere jaehrliche Konferenz.',
    workshops: 'Workshops',
    mentoring: 'Mentoring (MentorBridge)',
    conference: 'Jaehrliche Konferenz',
  },
  en: {
    title: 'Programme',
    intro: 'Workshops, mentoring and our annual conference.',
    workshops: 'Workshops',
    mentoring: 'Mentoring (MentorBridge)',
    conference: 'Annual Conference',
  },
  fr: {
    title: 'Programme',
    intro: 'Ateliers, mentorat et notre conference annuelle.',
    workshops: 'Ateliers',
    mentoring: 'Mentorat (MentorBridge)',
    conference: 'Conference annuelle',
  },
};

export default async function ProgrammePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = content[loc];
  const base = `/${loc}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
        {t.title}
      </h1>
      <p className="text-gray-600 mb-10">{t.intro}</p>
      <ul className="space-y-4">
        <li>
          <Link href={`${base}/programme/workshops`} className="text-primary font-medium hover:underline">
            {t.workshops}
          </Link>
        </li>
        <li>
          <Link href={`${base}/programme/mentoring`} className="text-primary font-medium hover:underline">
            {t.mentoring}
          </Link>
        </li>
        <li>
          <Link href={`${base}/programme/conference`} className="text-primary font-medium hover:underline">
            {t.conference}
          </Link>
        </li>
      </ul>
    </div>
  );
}
