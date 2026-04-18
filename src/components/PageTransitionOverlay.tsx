'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

type Phase = 'idle' | 'cover' | 'reveal';

function shouldHandleAnchor(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href');

  if (!href || href.startsWith('#') || anchor.target === '_blank' || anchor.hasAttribute('download')) {
    return false;
  }

  const url = new URL(anchor.href, window.location.href);

  if (url.origin !== window.location.origin) {
    return false;
  }

  if (url.pathname === window.location.pathname && url.search === window.location.search) {
    return false;
  }

  return true;
}

export function PageTransitionOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>('idle');
  const pendingPathRef = useRef<string | null>(null);
  const pendingHrefRef = useRef<string | null>(null);
  const navigationTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a');
      if (!(anchor instanceof HTMLAnchorElement) || !shouldHandleAnchor(anchor)) {
        return;
      }

      event.preventDefault();

      const url = new URL(anchor.href, window.location.href);
      const targetHref = `${url.pathname}${url.search}${url.hash}`;

      pendingPathRef.current = url.pathname;
      pendingHrefRef.current = targetHref;

      if (navigationTimerRef.current) {
        window.clearTimeout(navigationTimerRef.current);
      }

      setPhase('cover');

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      navigationTimerRef.current = window.setTimeout(() => {
        if (pendingHrefRef.current) {
          router.push(pendingHrefRef.current);
        }
      }, reduceMotion ? 0 : 180);
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      if (navigationTimerRef.current) {
        window.clearTimeout(navigationTimerRef.current);
      }
    };
  }, [router]);

  useEffect(() => {
    if (phase !== 'cover') {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fallback = window.setTimeout(() => {
      setPhase('reveal');
    }, reduceMotion ? 120 : 700);

    return () => window.clearTimeout(fallback);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'cover') {
      return;
    }

    const targetPath = pendingPathRef.current;
    if (!targetPath || pathname !== targetPath) {
      return;
    }

    setPhase('reveal');
  }, [pathname, phase]);

  useEffect(() => {
    if (phase !== 'reveal') {
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => {
      pendingPathRef.current = null;
      pendingHrefRef.current = null;
      setPhase('idle');
    }, reduceMotion ? 120 : 520);

    return () => window.clearTimeout(timeout);
  }, [phase]);

  return (
    <div
      aria-hidden
      className={`page-transition-overlay ${phase === 'idle' ? 'is-idle' : ''} ${phase === 'cover' ? 'is-cover' : ''} ${phase === 'reveal' ? 'is-reveal' : ''}`}
    >
      <div className="page-transition-overlay__veil" />
      <div className="page-transition-overlay__accent" />
      <div className="page-transition-overlay__line" />
    </div>
  );
}