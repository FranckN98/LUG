'use client';

import React, { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { trackEvent } from '@/lib/analytics';
import type { HomeSectionsCopy } from '@/content/homeSections';

type Status = 'idle' | 'loading' | 'success' | 'error';

type Props = {
  locale: Locale;
  copy: HomeSectionsCopy['next'];
  submitLabel: string;
};

/** Inscription d'information sur la prochaine édition (liste newsletter, tag « next-edition »). */
export function NextEditionNotifyForm({ locale, copy, submitLabel }: Props) {
  const t = copy.form;
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading' || !consent) return;
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent, website, locale, source: 'home_next_edition' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setStatus('error');
        setMessage(data?.error === 'invalid_email' ? t.invalid : data?.error === 'rate_limited' ? t.rate : t.error);
        return;
      }
      setStatus('success');
      setMessage(t.success);
      setEmail('');
      trackEvent('newsletter_signup', { button_location: 'home_next_edition', language: locale });
    } catch {
      setStatus('error');
      setMessage(t.error);
    }
  }

  if (status === 'success') {
    return (
      <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-3">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />
      <label htmlFor="next-edition-email" className="sr-only">
        {t.emailLabel}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="next-edition-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailLabel}
          className="min-h-[44px] min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-5 py-3 text-sm text-brand-dark placeholder:text-gray-500 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <button
          type="submit"
          disabled={status === 'loading' || !consent}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? t.sending : submitLabel}
        </button>
      </div>
      <label className="flex items-start gap-2.5 text-xs leading-snug text-gray-600">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-400 text-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <span>
          {t.consentPrefix}
          <a
            href={`/${locale}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary-light"
          >
            {t.consentLink}
          </a>
          {t.consentSuffix}
        </span>
      </label>
      {status === 'error' && message && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {message}
        </p>
      )}
    </form>
  );
}
