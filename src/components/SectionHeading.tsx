import React from 'react';

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  const eyebrowColor = light ? 'text-accent-light/90' : 'text-accent font-semibold';
  const titleColor = light ? 'text-white' : 'text-brand-dark';
  const subColor = light ? 'text-white/80' : 'text-gray-600';

  return (
    <div className={`max-w-3xl mb-12 sm:mb-16 ${alignClass}`}>
      {eyebrow && (
        <p className={`text-[0.65rem] sm:text-xs uppercase tracking-[0.25em] ${eyebrowColor} mb-4`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display text-3xl sm:text-4xl md:text-[2.75rem] font-semibold leading-tight ${titleColor} text-balance`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-base sm:text-lg leading-relaxed max-w-2xl ${align === 'center' ? 'mx-auto' : ''} ${subColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
