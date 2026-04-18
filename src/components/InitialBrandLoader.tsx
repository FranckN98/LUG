'use client';

import { useEffect, useState } from 'react';
import { BrandLoaderVisual } from '@/components/BrandLoaderVisual';

const SESSION_KEY = 'lug-intro-loader-seen';

export function InitialBrandLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasSeenLoader = window.sessionStorage.getItem(SESSION_KEY) === '1';

    if (hasSeenLoader) {
      setVisible(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setVisible(false);
      window.sessionStorage.setItem(SESSION_KEY, '1');
    }, reduceMotion ? 160 : 1350);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) {
    return null;
  }

  return <BrandLoaderVisual />;
}