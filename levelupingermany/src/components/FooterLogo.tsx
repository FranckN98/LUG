'use client';

import React from 'react';
import Link from 'next/link';
import footerLogo from '@/assets/footer-logo.png';

type Props = {
  /** e.g. /en */
  homeHref: string;
};

/**
 * Logo footer — fichier : `src/assets/footer-logo.png` (PNG, idéalement fond transparent).
 */
export function FooterLogo({ homeHref }: Props) {
  return (
    <Link
      href={homeHref}
      className="group inline-block min-h-[2.5rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
    >
      <img
        src={footerLogo.src}
        alt="Level Up in Germany"
        width={400}
        height={108}
        className="block h-auto max-h-24 sm:max-h-28 md:max-h-[7.5rem] w-auto max-w-[min(100%,360px)] object-contain object-left opacity-[0.97] group-hover:opacity-100 transition-opacity"
      />
    </Link>
  );
}
