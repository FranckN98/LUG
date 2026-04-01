import React from 'react';
import type { Locale } from '@/i18n/config';
import type { CoreTeamMember } from '@/content/core-team';

type Props = {
  members: CoreTeamMember[];
  /** Langue de la page (URL) — align\u00e9e sur le s\u00e9lecteur du header. */
  locale: Locale;
};

/** Grille \u00e9quipe : libell\u00e9s de r\u00f4les dans la langue active du site. */
export function CoreTeamGrid({ members, locale }: Props) {
  return (
    <section aria-label="Team">
      <ul className="mx-auto grid max-w-5xl list-none grid-cols-2 gap-3 p-0 m-0 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {members.map((m, i) => (
          <li key={`${m.image}-${i}`}>
            <article className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-primary/20 hover:shadow-md">
              <div className="relative aspect-[4/5] w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.image}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5 px-2.5 py-3 sm:px-3">
                <h3 className="text-sm font-semibold leading-snug text-primary sm:text-[0.95rem]">{m.name}</h3>
                <p
                  lang={locale}
                  className="border-t border-gray-100 pt-1.5 text-[11px] leading-snug text-gray-800 sm:text-xs"
                >
                  {m.role[locale]}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
