import React from 'react';
import Link from 'next/link';

/** Système visuel commun des sections de l'accueil situées sous le hero. */

export type SectionTone = 'white' | 'neutral' | 'warm' | 'dark' | 'brand';

const SECTION_BG: Record<SectionTone, string> = {
  white: 'bg-white text-brand-dark',
  neutral: 'bg-gray-50 text-brand-dark',
  warm: 'bg-accent/[0.07] text-brand-dark',
  dark: 'bg-brand-dark text-white',
  brand: 'bg-primary text-white',
};

export const isDarkTone = (tone: SectionTone) => tone === 'dark' || tone === 'brand';

export function HomeSection({
  id,
  tone,
  labelledBy,
  children,
}: {
  id?: string;
  tone: SectionTone;
  labelledBy: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`${SECTION_BG[tone]} scroll-mt-24 py-16 sm:py-24`}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, tone }: { children: React.ReactNode; tone: SectionTone }) {
  const color = tone === 'dark' ? 'text-accent' : tone === 'brand' ? 'text-accent-light' : 'text-primary';
  return <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${color}`}>{children}</p>;
}

export function SectionTitle({
  id,
  children,
  tone,
  size = 'md',
  flush = false,
}: {
  id: string;
  children: React.ReactNode;
  tone: SectionTone;
  size?: 'md' | 'lg';
  /** Sans marge haute (titre sans petit intitulé au-dessus). */
  flush?: boolean;
}) {
  const sizing = size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-3xl sm:text-4xl';
  return (
    <h2
      id={id}
      className={`${flush ? '' : 'mt-4 '}font-display font-semibold leading-tight text-balance ${sizing} ${isDarkTone(tone) ? 'text-white' : 'text-brand-dark'}`}
    >
      {children}
    </h2>
  );
}

export function Lead({ children, tone }: { children: React.ReactNode; tone: SectionTone }) {
  return (
    <p className={`mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${isDarkTone(tone) ? 'text-white/80' : 'text-gray-600'}`}>
      {children}
    </p>
  );
}

/* ── Boutons : principal, secondaire, lien textuel ─────────────────────────── */

type ButtonVariant = 'primary' | 'secondary' | 'text';

const FOCUS: Record<SectionTone, string> = {
  white: 'focus-visible:ring-primary focus-visible:ring-offset-white',
  neutral: 'focus-visible:ring-primary focus-visible:ring-offset-gray-50',
  warm: 'focus-visible:ring-primary focus-visible:ring-offset-white',
  dark: 'focus-visible:ring-accent focus-visible:ring-offset-brand-dark',
  brand: 'focus-visible:ring-white focus-visible:ring-offset-primary',
};

function buttonClass(variant: ButtonVariant, tone: SectionTone, large: boolean): string {
  const dark = isDarkTone(tone);
  const base = `inline-flex min-h-[44px] items-center justify-center gap-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${FOCUS[tone]}`;
  if (variant === 'text') {
    return `${base} rounded-sm underline-offset-4 hover:underline ${dark ? 'text-white' : 'text-primary'}`;
  }
  const size = large ? 'px-8 py-4 text-base' : 'px-6 py-3';
  const shape = `rounded-full ${size}`;
  if (variant === 'primary') {
    return `${base} ${shape} ${dark ? 'bg-accent text-brand-dark hover:bg-accent-light' : 'bg-primary text-white hover:bg-primary-light'}`;
  }
  return `${base} ${shape} border ${dark ? 'border-white/50 text-white hover:bg-white/10' : 'border-primary/50 text-primary hover:bg-primary/5'}`;
}

export function ArrowIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}

type ButtonLinkProps = {
  href: string;
  variant: ButtonVariant;
  tone: SectionTone;
  large?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

/** Lien interne (Link), ancre, mailto ou externe, avec l'un des trois traitements de bouton. */
export function ButtonLink({ href, variant, tone, large = false, onClick, children }: ButtonLinkProps) {
  const className = buttonClass(variant, tone, large);
  const content = (
    <>
      {children}
      {variant === 'text' && <ArrowIcon />}
    </>
  );
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }
  return (
    <a href={href} className={className} onClick={onClick}>
      {content}
    </a>
  );
}

export function ActionButton({
  variant,
  tone,
  onClick,
  children,
}: {
  variant: ButtonVariant;
  tone: SectionTone;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className={buttonClass(variant, tone, false)}>
      {children}
    </button>
  );
}

/* ── Icônes sobres (contour, trait 1.5) ────────────────────────────────────── */

type IconProps = { className?: string };

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
};

export const IconTrendingUp = ({ className = 'h-6 w-6' }: IconProps) => (
  <svg className={className} {...iconProps}>
    <path d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.281-2.28 5.941" />
  </svg>
);

export const IconLightBulb = ({ className = 'h-6 w-6' }: IconProps) => (
  <svg className={className} {...iconProps}>
    <path d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

export const IconUsers = ({ className = 'h-6 w-6' }: IconProps) => (
  <svg className={className} {...iconProps}>
    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const IconBolt = ({ className = 'h-6 w-6' }: IconProps) => (
  <svg className={className} {...iconProps}>
    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

export const IconEye = ({ className = 'h-6 w-6' }: IconProps) => (
  <svg className={className} {...iconProps}>
    <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

export const IconBookOpen = ({ className = 'h-6 w-6' }: IconProps) => (
  <svg className={className} {...iconProps}>
    <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

export const IconCheck = ({ className = 'h-5 w-5' }: IconProps) => (
  <svg className={className} {...iconProps} strokeWidth={2}>
    <path d="m4.5 12.75 6 6 9-13.5" />
  </svg>
);
