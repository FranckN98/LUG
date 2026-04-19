'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { BrandLoaderVisual } from '@/components/BrandLoaderVisual';
import { locales } from '@/i18n/config';

const SESSION_KEY = 'lug-intro-loader-seen';

function getLoaderScope(pathname: string) {
  // Affiche uniquement sur la page d'accueil (start page)
  return pathname === '/' ? 'home' : null;
}

export function InitialBrandLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const scope = getLoaderScope(pathname);
    if (!scope) {
      setVisible(false);
      return;
    }
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const storageKey = `${SESSION_KEY}:${scope}`;
    const hasSeenLoader = window.sessionStorage.getItem(storageKey) === '1';
    if (hasSeenLoader) {
      setVisible(false);
      return;
    }
    // Attendre 5 secondes avant d'afficher le loader
    const preDelay = window.setTimeout(() => {
      setVisible(true);
      const timeout = window.setTimeout(() => {
        setVisible(false);
        window.sessionStorage.setItem(storageKey, '1');
      }, reduceMotion ? 160 : 1350);
      // Nettoyage du timeout du loader
      return () => window.clearTimeout(timeout);
    }, 5000);
    // Nettoyage du pre-delay
    return () => window.clearTimeout(preDelay);
  }, [pathname]);

  if (!visible) return null;
  return <BrandLoaderVisual />;
}