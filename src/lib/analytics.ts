/**
 * Centralised, privacy-friendly analytics for Level Up in Germany.
 *
 * - Reads UTM params from the URL on first arrival, persists them in
 *   sessionStorage for the session, and attaches them to every event.
 * - Sends events to:
 *     1. Our own /api/analytics endpoint (always, no PII collected).
 *     2. Plausible / Umami / GA4 (only if cookie consent is granted).
 *
 * Usage:
 *   import { trackEvent } from '@/lib/analytics';
 *   trackEvent('newsletter_signup', { source: 'footer', language: 'fr' });
 */

export type AnalyticsEventName =
  | 'page_view'
  | 'ticket_button_click'
  | 'newsletter_signup'
  | 'contact_form_submit'
  | 'sponsor_form_submit'
  | 'member_registration'
  | 'event_popup_email_submit'
  | 'partner_button_click'
  | 'speaker_apply_click'
  | 'blog_like'
  | 'blog_share'
  | 'cta_click';

export type AnalyticsProperties = {
  page?: string;
  button_location?: string;
  source?: string;
  campaign?: string;
  form_type?: string;
  language?: string;
  [key: string]: string | number | boolean | null | undefined;
};

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
type UtmKey = (typeof UTM_KEYS)[number];
type UtmRecord = Partial<Record<UtmKey, string>>;

const SESSION_UTM_KEY = 'lug_utm';
const SESSION_ID_KEY = 'lug_session_id';
const CONSENT_KEY = 'lug_cookie_consent';

/* ─────────────────────────── UTM handling ────────────────────────────── */

export function captureUtmFromUrl(): UtmRecord {
  if (typeof window === 'undefined') return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const fresh: UtmRecord = {};
    for (const k of UTM_KEYS) {
      const v = params.get(k);
      if (v) fresh[k] = v.slice(0, 120);
    }
    if (Object.keys(fresh).length > 0) {
      sessionStorage.setItem(SESSION_UTM_KEY, JSON.stringify(fresh));
      return fresh;
    }
    const stored = sessionStorage.getItem(SESSION_UTM_KEY);
    return stored ? (JSON.parse(stored) as UtmRecord) : {};
  } catch {
    return {};
  }
}

export function getStoredUtm(): UtmRecord {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(SESSION_UTM_KEY);
    return raw ? (JSON.parse(raw) as UtmRecord) : {};
  } catch {
    return {};
  }
}

/* ─────────────────────────── Source detection ────────────────────────── */

export function inferSource(utm: UtmRecord, referrer: string | null): string {
  if (utm.utm_source) return utm.utm_source.toLowerCase();
  if (!referrer) return 'direct';
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, '').toLowerCase();
    if (host.includes('tiktok')) return 'tiktok';
    if (host.includes('instagram')) return 'instagram';
    if (host.includes('linkedin')) return 'linkedin';
    if (host.includes('whatsapp') || host.includes('wa.me')) return 'whatsapp';
    if (host.includes('facebook') || host.includes('fb.com')) return 'facebook';
    if (host.includes('twitter') || host === 'x.com' || host.endsWith('.x.com')) return 'twitter';
    if (host.includes('youtube') || host.includes('youtu.be')) return 'youtube';
    if (host.includes('google')) return 'google';
    if (host.includes('bing')) return 'bing';
    if (host.includes('mail') || host.includes('gmail') || host.includes('outlook')) return 'newsletter';
    return host;
  } catch {
    return 'direct';
  }
}

/* ─────────────────────────── Session id ──────────────────────────────── */

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

/* ─────────────────────────── Consent gating ──────────────────────────── */

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

/* ─────────────────────────── Third-party emit ────────────────────────── */

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    umami?: { track: (event: string, data?: Record<string, unknown>) => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

function emitToProviders(event: AnalyticsEventName, props: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;

  // Plausible — https://plausible.io
  if (typeof window.plausible === 'function') {
    try {
      window.plausible(event, { props });
    } catch {
      /* noop */
    }
  }

  // Umami — https://umami.is
  if (window.umami && typeof window.umami.track === 'function') {
    try {
      window.umami.track(event, props);
    } catch {
      /* noop */
    }
  }

  // Google Analytics 4 / Google Tag Manager
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', event, props);
    } catch {
      /* noop */
    }
  }
}

/* ─────────────────────────── Public API ──────────────────────────────── */

export function trackEvent(name: AnalyticsEventName, properties: AnalyticsProperties = {}): void {
  if (typeof window === 'undefined') return;

  const utm = getStoredUtm();
  const referrer = typeof document !== 'undefined' ? document.referrer || null : null;
  const source = inferSource(utm, referrer);
  const page = properties.page || window.location.pathname;
  const language = properties.language || document.documentElement.lang || undefined;

  const merged = {
    ...properties,
    page,
    language,
    source,
    ...utm,
    referrer,
  };

  // Fire-and-forget POST to our own endpoint (no PII, no message bodies)
  try {
    const payload = JSON.stringify({
      name,
      page,
      locale: language,
      referrer,
      utm,
      source,
      sessionId: getSessionId(),
      properties: sanitizeProperties(properties),
    });
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/analytics', blob);
    } else {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {
        /* noop */
      });
    }
  } catch {
    /* noop */
  }

  // Mirror to consented third-party providers
  emitToProviders(name, merged);
}

/** Strip anything that looks like free-form text (message, content, body…). */
function sanitizeProperties(props: AnalyticsProperties): Record<string, string | number | boolean> {
  const SENSITIVE = /^(message|body|content|notes?|comment|email|phone|address|firstname|lastname|fullname|name|password|motivation)$/i;
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (SENSITIVE.test(k)) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 200);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return out;
}

/** Track a page view. Call from a top-level client component on route changes. */
export function trackPageView(page?: string): void {
  if (typeof window === 'undefined') return;
  trackEvent('page_view', { page: page || window.location.pathname });
}
