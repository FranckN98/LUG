'use client';

import React, { useCallback, useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Locale } from '@/i18n/config';
import { eventsCopy } from '@/content/events';
import { TurnstileField } from '@/components/TurnstileField';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';

type EventsT = (typeof eventsCopy)[Locale];

function IconBookSmartDownload({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  );
}

const MODAL_I18N: Record<
  Locale,
  {
    captchaHint: string;
    captchaRequired: string;
    captchaFailed: string;
    emailNotConfigured: string;
    emailSendFailed: string;
    genericError: string;
    invalidEmail: string;
    rateLimited: string;
    blocked: string;
    close: string;
  }
> = {
  de: {
    captchaHint: 'Sicherheitsprüfung',
    captchaRequired: 'Bitte bestätigen Sie die Sicherheitsprüfung.',
    captchaFailed: 'Sicherheitsprüfung fehlgeschlagen. Bitte erneut versuchen.',
    emailNotConfigured:
      'E-Mail-Versand nicht konfiguriert (RESEND_API_KEY in .env.local). Bitte den Betreiber kontaktieren.',
    emailSendFailed:
      'Der Mail-Dienst hat die Nachricht abgelehnt. Prüfen Sie in Resend: Domain, Absender-Adresse und Ziel-E-Mail.',
    genericError: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
    invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    rateLimited: 'Zu viele Anfragen. Bitte später erneut versuchen.',
    blocked: 'Bitte warten Sie einen Moment und senden Sie das Formular erneut.',
    close: 'Schließen',
  },
  en: {
    captchaHint: 'Security check',
    captchaRequired: 'Please complete the security check.',
    captchaFailed: 'Security check failed. Please try again.',
    emailNotConfigured:
      'Email not configured (RESEND_API_KEY in .env.local). Please contact the site admin.',
    emailSendFailed:
      'The mail service rejected the message. In Resend, check your domain, sender address, and recipient.',
    genericError: 'Something went wrong. Please try again.',
    invalidEmail: 'Please enter a valid email address.',
    rateLimited: 'Too many requests. Please try again later.',
    blocked: 'Please wait a moment and submit the form again.',
    close: 'Close',
  },
  fr: {
    captchaHint: 'Vérification de sécurité',
    captchaRequired: 'Veuillez compléter la vérification de sécurité.',
    captchaFailed: 'Échec de la vérification. Réessayez.',
    emailNotConfigured:
      "Envoi non configuré (RESEND_API_KEY dans .env.local). Contactez l'administrateur du site.",
    emailSendFailed:
      "Le service mail a refusé l'envoi. Vérifiez dans Resend : domaine, expéditeur et destinataire.",
    genericError: 'Échec. Réessayez.',
    invalidEmail: 'Veuillez saisir une adresse e-mail valide.',
    rateLimited: 'Trop de demandes. Réessayez plus tard.',
    blocked: 'Attendez un instant et renvoyez le formulaire.',
    close: 'Fermer',
  },
};

type Props = {
  locale: Locale;
  edition: string;
  pdfPath?: string;
  title: string;
  subtitle: string;
  t: EventsT;
};

export function EventPdfDownloadCta({ locale, edition, pdfPath, title, subtitle, t }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const uid = useId();
  const i18n = MODAL_I18N[locale];
  const captchaEnabled = Boolean(TURNSTILE_SITE_KEY);
  const privacyHref = `/${locale}/privacy`;

  const close = useCallback(() => {
    setOpen(false);
    setStatus('idle');
    setDisplayError(null);
    setCaptchaToken(null);
    setTurnstileKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setDisplayError(i18n.invalidEmail);
      setStatus('error');
      return;
    }
    if (captchaEnabled && !captchaToken) {
      setDisplayError(i18n.captchaRequired);
      setStatus('error');
      return;
    }
    setDisplayError(null);
    setStatus('sending');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          edition,
          pdfPath,
          consent,
          website: honeypot,
          startedAt,
          submittedAt: Date.now(),
          locale,
          ...(captchaEnabled && captchaToken ? { captchaToken } : {}),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        pdfPath?: string;
      };

      if (!res.ok) {
        if (data.error === 'captcha_failed') setDisplayError(i18n.captchaFailed);
        else if (data.error === 'invalid_email') setDisplayError(i18n.invalidEmail);
        else if (data.error === 'email_not_configured') setDisplayError(i18n.emailNotConfigured);
        else if (data.error === 'email_send_failed') setDisplayError(i18n.emailSendFailed);
        else if (data.error === 'rate_limited') setDisplayError(i18n.rateLimited);
        else if (data.error === 'blocked') setDisplayError(i18n.blocked);
        else setDisplayError(i18n.genericError);
        setStatus('error');
        setCaptchaToken(null);
        setTurnstileKey((k) => k + 1);
        return;
      }

      setStatus('success');
      setCaptchaToken(null);
      setTurnstileKey((k) => k + 1);
      if (data.pdfPath && typeof window !== 'undefined') {
        const url = `${window.location.origin}${data.pdfPath}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch {
      setDisplayError(i18n.genericError);
      setStatus('error');
      setCaptchaToken(null);
      setTurnstileKey((k) => k + 1);
    }
  };

  const modal =
    open &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center sm:p-6"
        role="presentation"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`${uid}-title`}
          className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-brand-dark p-6 text-white shadow-2xl"
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-3 top-3 rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label={i18n.close}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 id={`${uid}-title`} className="pr-10 text-lg font-bold text-white">
            {t.pdfModalTitle}
          </h2>
          <p className="mt-2 text-sm text-white/70">{t.pdfModalIntro}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
            />
            <div>
              <label htmlFor={`${uid}-email`} className="block text-sm font-medium text-white/80">
                {t.pdfEmailLabel}
                <span className="text-accent">*</span>
              </label>
              <input
                id={`${uid}-email`}
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/[0.07] px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/80"
              />
            </div>

            {captchaEnabled && (
              <div>
                <p className="mb-2 text-xs font-medium text-white/65">{i18n.captchaHint}</p>
                <TurnstileField
                  key={turnstileKey}
                  siteKey={TURNSTILE_SITE_KEY}
                  onToken={setCaptchaToken}
                  theme="dark"
                  variant="footerDark"
                />
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id={`${uid}-consent`}
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 rounded border-white/30 bg-white/5 text-accent focus:ring-accent"
              />
              <label htmlFor={`${uid}-consent`} className="text-xs leading-snug text-white/60">
                {t.pdfConsentLabel}{' '}
                <a href={privacyHref} className="text-accent underline underline-offset-2 hover:text-accent-light">
                  {t.pdfPrivacyLinkText}
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-brand-dark transition hover:bg-accent-light disabled:opacity-60"
            >
              {status === 'sending' ? t.pdfSendingLabel : t.pdfSubmitLabel}
            </button>

            {status === 'success' && (
              <p className="text-sm text-emerald-300/95" role="status">
                {t.pdfSuccessMessage}
              </p>
            )}
            {status === 'error' && (
              <p className="text-sm text-red-300/95" role="alert">
                {displayError ?? i18n.genericError}
              </p>
            )}
          </form>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-[#1a0a0a] via-primary to-[#3d0f12] p-1 shadow-2xl shadow-primary/30">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
        <div className="relative rounded-[1.35rem] bg-gradient-to-br from-white/[0.08] to-transparent px-5 py-6 sm:px-8 sm:py-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="group relative flex w-full flex-col gap-5 text-left sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-4 sm:items-center">
              <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 shadow-inner ring-2 ring-white/20 transition duration-300 group-hover:scale-105 group-hover:ring-accent/60">
                <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-accent/0 via-transparent to-accent/25 opacity-0 transition group-hover:opacity-100" />
                <IconBookSmartDownload className="relative h-9 w-9 text-white drop-shadow-md" />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold tracking-tight text-white sm:text-xl">{title}</p>
                <p className="mt-1 text-sm text-white/75">{subtitle}</p>
              </div>
            </div>
            <span className="inline-flex items-center justify-center gap-2 self-stretch rounded-2xl bg-accent px-6 py-3.5 text-sm font-bold text-brand-dark shadow-lg shadow-black/20 transition duration-300 group-hover:bg-accent-light group-hover:shadow-xl sm:self-center">
              <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
              </svg>
              PDF
            </span>
          </button>
        </div>
      </section>
      {modal}
    </>
  );
}
