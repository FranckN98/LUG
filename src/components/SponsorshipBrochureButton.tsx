'use client';

import type { ReactNode } from 'react';
import { trackEvent } from '@/lib/analytics';

export function SponsorshipBrochureButton({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  function handleClick() {
    try {
      const key = `lug_brochure_request:${href}`;
      const previous = Number(sessionStorage.getItem(key) || 0);
      if (Date.now() - previous < 30_000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      // Storage can be unavailable; the download should still work.
    }
    trackEvent('sponsor_brochure_download', {
      page: window.location.pathname,
      source: 'sponsorship_page',
      brochure_version: href.split('/').pop() || 'active',
    });
  }

  return (
    <a href={href} download onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
