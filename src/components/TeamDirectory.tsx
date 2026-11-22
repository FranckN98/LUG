'use client';

import React, { useMemo, useState } from 'react';
import type { CoreTeamMember } from '@/content/core-team';
import type { Locale } from '@/i18n/config';

export type PublicTeamCategory = {
  id: string;
  nameDe: string;
  nameEn: string;
  nameFr: string;
  sortOrder: number;
  memberNames: string[];
};

type Props = {
  members: CoreTeamMember[];
  categories: PublicTeamCategory[];
  locale: Locale;
};

export function TeamDirectory({ members, categories, locale }: Props) {
  const [activeCategory, setActiveCategory] = useState('all');

  const visibleMembers = useMemo(() => {
    if (activeCategory === 'all') return members;
    const category = categories.find((item) => item.id === activeCategory);
    if (!category) return members;
    const names = new Set(category.memberNames);
    return members.filter((member) => names.has(member.name));
  }, [activeCategory, categories, members]);

  const categoryName = (category: PublicTeamCategory) =>
    locale === 'de' ? category.nameDe : locale === 'fr' ? category.nameFr : category.nameEn;

  return (
    <div>
      <div className="mb-6 flex flex-nowrap gap-1.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          aria-pressed={activeCategory === 'all'}
          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all sm:px-3.5 sm:text-xs ${
            activeCategory === 'all'
              ? 'bg-accent text-white shadow-[0_8px_30px_rgba(233,140,11,.25)]'
              : 'border border-white/15 bg-white/5 text-white/70 hover:border-accent/50 hover:text-white'
          }`}
        >
          Level Up Team
        </button>
        {categories.map((category) => {
          const hasMembers = category.memberNames.some((name) => members.some((member) => member.name === name));
          if (!hasMembers) return null;
          const active = activeCategory === category.id;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveCategory(category.id)}
              aria-pressed={active}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] transition-all sm:px-3.5 sm:text-xs ${
                active
                  ? 'bg-accent text-white shadow-[0_8px_30px_rgba(233,140,11,.25)]'
                  : 'border border-white/15 bg-white/5 text-white/70 hover:border-accent/50 hover:text-white'
              }`}
            >
              {categoryName(category)}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 transition-opacity sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {visibleMembers.map((member) => (
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
