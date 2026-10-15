import { getLemfiPublicSettings } from '@/config/lemfiContest';
import { getSiteUrl } from '@/config/site';

/** En-tête commun : logo Level Up et, si fourni, logo officiel LemFi (jamais recréé ici). */
export function ContestHeader() {
  const { logoPath } = getLemfiPublicSettings();
  return (
    <header className="flex items-center justify-center gap-4 pb-2 pt-1">
      <a href={getSiteUrl()} aria-label="Level Up in Germany — accueil">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Level Up in Germany" className="h-12 w-auto sm:h-14" />
      </a>
      {logoPath && (
        <>
          <span aria-hidden="true" className="text-xl font-semibold text-brand-dark/40">
            ×
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoPath} alt="LemFi" className="h-9 w-auto sm:h-11" />
        </>
      )}
    </header>
  );
}
