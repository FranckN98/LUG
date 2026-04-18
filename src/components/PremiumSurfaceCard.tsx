import React from 'react';
import Link from 'next/link';

type PremiumSurfaceCardProps = {
  title: string;
  description: string;
  /** Optional line above body (e.g. role label) */
  subtitle?: string;
  href?: string;
  icon?: React.ReactNode;
  className?: string;
};

/**
 * Elevated card with soft shadow, rounded corners, premium hover.
 */
export function PremiumSurfaceCard({
  title,
  description,
  subtitle,
  href,
  icon,
  className = '',
}: PremiumSurfaceCardProps) {
  const inner = (
    <>
      {icon && (
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-brand-dark group-hover:text-primary transition-colors">
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-accent">{subtitle}</p>
      )}
      <p className="mt-2 text-sm text-gray-600 leading-relaxed flex-1">{description}</p>
      {href && (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="translate-x-0 group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
      )}
    </>
  );

  const shell =
    'group relative flex flex-col h-full rounded-2xl border border-gray-100/70 bg-white p-7 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_48px_-12px_rgba(140,26,26,0.12)] hover:-translate-y-1.5 hover:border-primary/15 transition-all duration-300';

  if (href) {
    return (
      <Link href={href} className={`${shell} ${className}`}>
        {inner}
      </Link>
    );
  }

  return <div className={`${shell} ${className}`}>{inner}</div>;
}
