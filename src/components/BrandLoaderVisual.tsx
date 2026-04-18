import Image from 'next/image';
import navLogoImage from '@/assets/lug-mark-nobg.png';

export function BrandLoaderVisual({
  label = 'Entering Level Up in Germany',
}: {
  label?: string;
}) {
  return (
    <div
      className="brand-loader-shell fixed inset-0 z-[120] flex items-center justify-center px-6"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="brand-loader-orb" aria-hidden />
      <div className="brand-loader-panel relative flex w-full max-w-md flex-col items-center gap-6 rounded-[2rem] border border-white/20 bg-[rgba(244,241,235,0.72)] px-8 py-10 text-center shadow-[0_20px_80px_-28px_rgba(26,26,26,0.42)] backdrop-blur-xl">
        <div className="brand-loader-mark-wrap flex h-20 w-20 items-center justify-center rounded-full border border-primary/12 bg-white/55 shadow-[0_10px_30px_-16px_rgba(140,26,26,0.35)]">
          <Image
            src={navLogoImage}
            alt="Level Up in Germany"
            width={64}
            height={64}
            priority
            className="brand-loader-mark h-12 w-12 object-contain"
          />
        </div>
        <div className="space-y-3">
          <p className="brand-loader-kicker text-[0.72rem] font-bold uppercase tracking-[0.34em] text-primary/75">
            Cultural Momentum
          </p>
          <h2 className="brand-loader-title font-display text-3xl font-semibold tracking-[0.01em] text-brand-dark sm:text-[2.2rem]">
            Level Up in Germany
          </h2>
          <p className="brand-loader-copy mx-auto max-w-xs text-sm leading-6 text-brand-dark/70 sm:text-[0.95rem]">
            Community, events and ambition in one refined experience.
          </p>
        </div>
        <div className="brand-loader-progress w-full max-w-[15rem] overflow-hidden rounded-full bg-brand-dark/8">
          <span className="brand-loader-progress-bar block h-[3px] w-full origin-left rounded-full" />
        </div>
      </div>
    </div>
  );
}