import React from 'react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { CORE_TEAM_MEMBERS } from '@/content/core-team';
import { whoWeAreContent } from '@/content/who-we-are';
import { CoreTeamGrid } from '@/components/CoreTeamGrid';
import { generateMetadataForPath } from '@/lib/seo';

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  return generateMetadataForPath(props.params, '/who-we-are');
}

export default async function WhoWeArePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = (locale === 'de' || locale === 'en' || locale === 'fr' ? locale : 'de') as Locale;
  const t = whoWeAreContent[loc];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-10 text-center sm:mb-12 sm:text-left">
        <h1 className="text-2xl font-bold text-primary sm:text-3xl">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600 sm:mx-0 sm:text-base">
          {t.intro}
        </p>
      </header>

      <div className="space-y-14 sm:space-y-16">
        {/* —— Équipe en premier —— */}
        <section aria-labelledby="who-team-heading" className="max-w-3xl">
          <h2
            id="who-team-heading"
            className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/80"
          >
            {t.team.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-gray-700">{t.team.lead}</p>
        </section>

        <div className="sm:-mt-4">
          <CoreTeamGrid members={CORE_TEAM_MEMBERS} locale={loc} />
        </div>

        {/* —— Notre histoire —— */}
        <section aria-labelledby="who-story-heading" className="max-w-3xl">
          <h2
            id="who-story-heading"
            className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/80"
          >
            {t.story.heading}
          </h2>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-gray-800">
            {t.story.lines.map((line, i) => (
              <p key={`story-line-${i}`}>{line}</p>
            ))}
            <blockquote className="border-l-4 border-accent pl-4 text-lg font-medium text-primary sm:text-xl">
              {t.story.highlight}
            </blockquote>
            {t.story.afterHighlight.map((line, i) => (
              <p key={`story-after-${i}`} className="text-gray-700">
                {line}
              </p>
            ))}
          </div>
        </section>

        {/* —— Notre vision —— */}
        <section aria-labelledby="who-vision-heading" className="max-w-3xl">
          <h2
            id="who-vision-heading"
            className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-primary/80"
          >
            {t.vision.heading}
          </h2>
          <div className="mt-5 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.04] to-accent/[0.06] px-5 py-6 sm:px-7 sm:py-8">
            <div className="space-y-4 text-base leading-relaxed text-gray-800">
              {t.vision.paragraphs.map((p, i) => (
                <p
                  key={`vision-${i}`}
                  className={i === 0 ? 'text-lg font-semibold text-primary sm:text-xl' : undefined}
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="mt-10 border-t border-gray-100 pt-8 sm:mt-12">
        <Link
          href={`/${loc}/contact`}
          className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-light"
        >
          {t.ctaContact}
        </Link>
      </div>
    </div>
  );
}
