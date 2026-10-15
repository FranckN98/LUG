import { CroppedLogo, LEMFI_LOGO, LEVELUP_LOGO } from './CroppedLogo';

const pill =
  'flex items-center rounded-2xl bg-white px-4 py-2.5 shadow-[0_12px_40px_-14px_rgba(0,0,0,0.65)] ring-1 ring-white/60 sm:px-5 sm:py-3';

/** Logos Level Up et LemFi côte à côte, en haut de page. */
export function CoBrand({ homeHref, homeAria }: { homeHref: string; homeAria: string }) {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      <a href={homeHref} aria-label={homeAria} className={`${pill} transition hover:scale-[1.02]`}>
        <CroppedLogo {...LEVELUP_LOGO} alt="Level Up in Germany" className="h-7 sm:h-9" />
      </a>
      <span aria-hidden="true" className="font-display text-3xl font-semibold leading-none text-[#F5B800] sm:text-4xl">
        ×
      </span>
      <span className={pill}>
        <CroppedLogo {...LEMFI_LOGO} alt="LemFi" className="h-7 sm:h-9" />
      </span>
    </div>
  );
}
