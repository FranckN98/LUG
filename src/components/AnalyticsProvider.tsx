'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { captureUtmFromUrl, hasAnalyticsConsent, trackPageView } from '@/lib/analytics';

const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC;
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function AnalyticsProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTracked = useRef<string>('');
  const [consent, setConsent] = useState(false);

  // Hydrate consent state on mount + react to banner changes
  useEffect(() => {
    setConsent(hasAnalyticsConsent());
    function refresh() {
      setConsent(hasAnalyticsConsent());
    }
    window.addEventListener('storage', refresh);
    window.addEventListener('lug:consent-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('lug:consent-changed', refresh);
    };
  }, []);

  // Capture UTMs on first load
  useEffect(() => {
    captureUtmFromUrl();
  }, []);

  // Track page views on every route change
  useEffect(() => {
    if (!pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : '');
    if (lastTracked.current === url) return;
    lastTracked.current = url;
    trackPageView(url);
  }, [pathname, searchParams]);

  return (
    <>
      {consent && PLAUSIBLE_DOMAIN && (
        <Script
          src="https://plausible.io/js/script.tagged-events.js"
          data-domain={PLAUSIBLE_DOMAIN}
          strategy="afterInteractive"
        />
      )}

      {consent && UMAMI_WEBSITE_ID && UMAMI_SRC && (
        <Script src={UMAMI_SRC} data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
      )}

      {consent && GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}
