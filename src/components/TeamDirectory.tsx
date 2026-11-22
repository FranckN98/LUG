'use client';

import React from 'react';
import type { CoreTeamMember } from '@/content/core-team';
import type { Locale } from '@/i18n/config';

type Props = {
  members: CoreTeamMember[];
  locale: Locale;
};

export function TeamDirectory({ members, locale }: Props) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {members.map((member) => (
          <article key={member.name} className="group relative flex flex-col overflow-hidden rounded-2xl ring-1 ring-white/10 transition-all duration-300 hover:scale-[1.01] hover:ring-accent/50">
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900">
              <img
                src={member.image}
                alt={member.name}
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute left-0 top-0 h-[3px] w-0 bg-gradient-to-r from-accent to-primary transition-all duration-500 group-hover:w-full" />
              <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 sm:px-4 sm:pb-4">
                <p className="mb-1 text-[10px] font-semibold leading-none uppercase tracking-widest text-accent sm:text-xs">
                  {member.role[locale]}
                </p>
                <h3 className="font-display text-sm font-bold leading-tight text-white sm:text-[0.95rem]">
                  {member.name}
                </h3>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
