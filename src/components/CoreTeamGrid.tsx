'use client';

import React from 'react';
import type { Locale } from '@/i18n/config';
import type { CoreTeamMember } from '@/content/core-team';

type Props = {
  members: CoreTeamMember[];
  locale: Locale;
};

export function CoreTeamGrid({ members, locale }: Props) {
  return (
    <section aria-label="Team">
      {/* Grid */}
      <ul className="list-none p-0 m-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {members.map((m, i) => (
          <li key={`${m.image}-${i}`}>
            <article className="group relative flex flex-col overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-300 hover:ring-accent/50 hover:scale-[1.01]">
              {/* Photo */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
                <img
                  src={m.image}
                  alt={m.name}
                  className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                {/* Top accent bar */}
                <div className="absolute top-0 left-0 h-[3px] w-0 bg-gradient-to-r from-accent to-primary transition-all duration-500 group-hover:w-full" />

                {/* Name + role */}
                <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 sm:px-4 sm:pb-4">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-widest text-accent leading-none mb-1">
                    {m.role[locale]}
                  </p>
                  <h3 className="text-sm sm:text-[0.95rem] font-bold text-white leading-tight font-display">
                    {m.name}
                  </h3>
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
