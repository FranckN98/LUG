import React from 'react';
import Link from 'next/link';

type HeroProps = {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaHref?: string;
  imageUrl?: string;
  className?: string;
};

export function Hero({
  title,
  subtitle,
  ctaText,
  ctaHref,
  imageUrl,
  className = '',
}: HeroProps) {
  return (
    <section
      className={`relative min-h-[40vh] sm:min-h-[50vh] flex flex-col items-center justify-center text-center px-4 py-16 sm:py-24 ${className}`}
    >
      {imageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${imageUrl})` }}
          aria-hidden
        />
      )}
      <div className="relative z-10 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-4">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg sm:text-xl text-gray-600 mb-6">{subtitle}</p>
        )}
        {ctaText && ctaHref && (
          <Link
            href={ctaHref}
            className="inline-block px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-dark transition"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}
