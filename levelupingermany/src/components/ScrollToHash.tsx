'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Scrolls to #hash when present (e.g. /en#contact → bandeau contact du footer).
 */
export function ScrollToHash() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollToId = () => {
      const id = window.location.hash.replace(/^#/, '');
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      window.setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    };

    scrollToId();
    window.addEventListener('hashchange', scrollToId);
    return () => window.removeEventListener('hashchange', scrollToId);
  }, [pathname]);

  return null;
}
