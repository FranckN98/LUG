'use client';

import { useState } from 'react';
import type { Locale } from '@/i18n/config';

type Status = 'idle' | 'loading' | 'success' | 'error';

const COPY = {
  fr: {
    title: 'Newsletter',
    subtitle: 'Recevez nos actus, événements et opportunités.',
    placeholder: 'Votre adresse e-mail',
    button: "S'abonner",
    success: 'Merci ! Votre inscription est confirmée.',
    invalid: 'Adresse e-mail invalide.',
    error: "Une erreur est survenue. Réessayez plus tard.",
    rate: 'Trop de tentatives. Réessayez plus tard.',
    consent: "J'accepte de recevoir la newsletter.",
  },
  en: {
    title: 'Newsletter',
    subtitle: 'Get our news, events and opportunities.',
    placeholder: 'Your email address',
    button: 'Subscribe',
    success: 'Thanks! Your subscription is confirmed.',
    invalid: 'Invalid email address.',
    error: 'Something went wrong. Please try again later.',
    rate: 'Too many attempts. Try again later.',
    consent: 'I agree to receive the newsletter.',
  },
  de: {
    title: 'Newsletter',
    subtitle: 'Erhalten Sie unsere News, Events und Chancen.',
    placeholder: 'Ihre E-Mail-Adresse',
    button: 'Abonnieren',
    success: 'Danke! Ihre Anmeldung ist bestätigt.',
    invalid: 'Ungültige E-Mail-Adresse.',
    error: 'Ein Fehler ist aufgetreten. Bitte später erneut versuchen.',
    rate: 'Zu viele Versuche. Bitte später erneut versuchen.',
    consent: 'Ich stimme dem Erhalt des Newsletters zu.',
  },
} as const;

export function FooterNewsletter({ locale }: { locale: Locale }) {
  const t = COPY[locale];
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, consent: true, website, locale }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        const code = data?.error;
        setStatus('error');
        if (code === 'invalid_email') setMessage(t.invalid);
        else if (code === 'rate_limited') setMessage(t.rate);
        else setMessage(t.error);
        return;
      }
      setStatus('success');
      setMessage(t.success);
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(t.error);
    }
  }

  return (
    <div className="flex min-w-0 flex-col">
      <p className="mb-2 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/45">
        {t.title}
      </p>
      <p className="mb-3 text-xs text-white/55 leading-snug">{t.subtitle}</p>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-2">
        {/* Honeypot */}
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
        <div className="flex gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.placeholder}
            aria-label={t.placeholder}
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-sm text-white placeholder-white/35 focus:outline-none focus:border-accent/60 focus:bg-white/[0.10] transition"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-accent px-4 py-2 text-xs font-semibold text-brand-dark transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'loading' ? '…' : t.button}
          </button>
        </div>
        <p className="text-[0.65rem] text-white/35 leading-snug">{t.consent}</p>
        {message && (
          <p
            role="status"
            className={`text-[0.7rem] mt-1 ${status === 'success' ? 'text-emerald-300' : 'text-rose-300'}`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
