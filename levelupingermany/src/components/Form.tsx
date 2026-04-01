'use client';

import React, { useId, useState } from 'react';
import type { Locale } from '@/i18n/config';
import { TurnstileField } from '@/components/TurnstileField';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';

type FormField = {
  name: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  label: string;
  required?: boolean;
  options?: string[];
};

const FORM_I18N: Record<
  Locale,
  { captchaHint: string; captchaRequired: string; captchaFailed: string; emailNotConfigured: string; genericError: string }
> = {
  de: {
    captchaHint: 'Sicherheitsprüfung',
    captchaRequired: 'Bitte bestätigen Sie die Sicherheitsprüfung.',
    captchaFailed: 'Sicherheitsprüfung fehlgeschlagen. Bitte erneut versuchen.',
    emailNotConfigured: 'Der Versand ist vorübergehend nicht möglich. Bitte später erneut versuchen oder uns per WhatsApp kontaktieren.',
    genericError: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
  },
  en: {
    captchaHint: 'Security check',
    captchaRequired: 'Please complete the security check.',
    captchaFailed: 'Security check failed. Please try again.',
    emailNotConfigured: 'Sending is temporarily unavailable. Please try again later or contact us on WhatsApp.',
    genericError: 'Submission failed. Please try again.',
  },
  fr: {
    captchaHint: 'Vérification de sécurité',
    captchaRequired: 'Veuillez compléter la vérification de sécurité.',
    captchaFailed: 'Échec de la vérification. Réessayez.',
    emailNotConfigured: "L'envoi est temporairement indisponible. Réessayez plus tard ou contactez-nous sur WhatsApp.",
    genericError: "L'envoi a échoué. Réessayez.",
  },
};

type FormProps = {
  fields: FormField[];
  submitLabel: string;
  consentLabel: string;
  consentLinkHref?: string;
  consentLinkText?: string;
  formType?: 'contact' | 'join' | 'workshop-registration' | 'mentor-request' | 'sponsor-inquiry';
  onSubmit?: (data: Record<string, string>) => void;
  className?: string;
  /** Localized status messages */
  sendingLabel?: string;
  successMessage?: string;
  errorMessage?: string;
  /** Champs discrets sur fond sombre (footer) */
  variant?: 'default' | 'footerDark';
  /** Pour les messages captcha / erreurs API */
  locale?: Locale;
};

export function Form({
  fields,
  submitLabel,
  consentLabel,
  consentLinkHref,
  consentLinkText,
  formType = 'contact',
  onSubmit,
  className = '',
  sendingLabel = 'Sending…',
  successMessage = 'Message sent successfully.',
  errorMessage = 'Submission failed. Please try again.',
  variant = 'default',
  locale = 'en',
}: FormProps) {
  const i18n = FORM_I18N[locale] ?? FORM_I18N.en;
  const isFooter = variant === 'footerDark';
  const labelCls = isFooter
    ? 'block text-xs font-medium text-white/65 mb-1'
    : 'block text-sm font-medium text-gray-700 mb-1';
  const fieldCls = isFooter
    ? 'w-full px-3 py-2 text-sm text-white placeholder:text-white/35 bg-white/[0.07] border border-white/15 rounded-lg focus:ring-1 focus:ring-accent/80 focus:border-accent/50 focus:outline-none transition-colors'
    : 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent';
  const consentLabelCls = isFooter ? 'text-xs text-white/60 leading-snug' : 'text-sm text-gray-600';
  const linkCls = isFooter ? 'text-accent hover:text-accent-light underline underline-offset-2' : 'text-primary underline';
  const btnCls = isFooter
    ? 'w-full sm:w-auto text-sm px-5 py-2 rounded-lg border border-white/25 bg-white/[0.08] text-white font-medium hover:bg-accent/20 hover:border-accent/50 transition disabled:opacity-60'
    : 'w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-light transition disabled:opacity-70';
  const successCls = isFooter ? 'text-sm text-emerald-300/95' : 'text-sm text-green-700';
  const errorCls = isFooter ? 'text-sm text-red-300/95' : 'text-sm text-red-700';
  const checkboxCls = isFooter
    ? 'mt-0.5 rounded border-white/30 bg-white/5 text-accent focus:ring-accent focus:ring-offset-0 focus:ring-offset-transparent'
    : 'mt-1 rounded border-gray-300 text-primary focus:ring-primary';

  const uid = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [startedAt] = useState<number>(Date.now());
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);

  const captchaEnabled = Boolean(TURNSTILE_SITE_KEY);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    if (!consent) return;
    if (captchaEnabled && !captchaToken) {
      setDisplayError(i18n.captchaRequired);
      setStatus('error');
      return;
    }
    setDisplayError(null);
    setStatus('sending');

    try {
      const payload = {
        type: formType,
        values,
        meta: {
          consent,
          startedAt,
          submittedAt: Date.now(),
          honeypot,
        },
        ...(captchaEnabled && captchaToken ? { captchaToken } : {}),
      };

      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };

      if (!res.ok) {
        if (data.error === 'captcha_failed') {
          setDisplayError(i18n.captchaFailed);
        } else if (data.error === 'email_not_configured' || data.error === 'email_send_failed') {
          setDisplayError(i18n.emailNotConfigured);
        } else {
          setDisplayError(errorMessage);
        }
        setStatus('error');
        setCaptchaToken(null);
        setTurnstileKey((k) => k + 1);
        return;
      }

      onSubmit?.(values);
      setStatus('success');
      setCaptchaToken(null);
      setTurnstileKey((k) => k + 1);
    } catch {
      setDisplayError(errorMessage);
      setStatus('error');
      setCaptchaToken(null);
      setTurnstileKey((k) => k + 1);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`${isFooter ? 'space-y-3' : 'space-y-4'} max-w-xl ${className}`}
    >
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
      {fields.map((field) => (
        <div key={field.name}>
          <label htmlFor={`${uid}-${field.name}`} className={labelCls}>
            {field.label}
            {field.required && <span className="text-accent">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              id={`${uid}-${field.name}`}
              name={field.name}
              required={field.required}
              rows={isFooter ? 3 : 4}
              value={values[field.name] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              className={fieldCls}
            />
          ) : field.type === 'select' ? (
            <select
              id={`${uid}-${field.name}`}
              name={field.name}
              required={field.required}
              value={values[field.name] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              className={fieldCls}
            >
              <option value="">—</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              id={`${uid}-${field.name}`}
              name={field.name}
              required={field.required}
              value={values[field.name] ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
              className={fieldCls}
            />
          )}
        </div>
      ))}
      {captchaEnabled && (
        <div>
          <p className={`${labelCls} mb-2`}>{i18n.captchaHint}</p>
          <TurnstileField
            key={turnstileKey}
            siteKey={TURNSTILE_SITE_KEY}
            onToken={setCaptchaToken}
            theme={isFooter ? 'dark' : 'light'}
            variant={variant}
          />
        </div>
      )}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          id={`${uid}-consent`}
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className={checkboxCls}
        />
        <label htmlFor={`${uid}-consent`} className={consentLabelCls}>
          {consentLabel}
          {consentLinkHref && consentLinkText && (
            <>
              {' '}
              <a href={consentLinkHref} className={linkCls}>
                {consentLinkText}
              </a>
            </>
          )}
        </label>
      </div>
      <button type="submit" disabled={status === 'sending'} className={btnCls}>
        {status === 'sending' ? sendingLabel : submitLabel}
      </button>
      {status === 'success' && (
        <p className={successCls} role="status">
          {successMessage}
        </p>
      )}
      {status === 'error' && (
        <p className={errorCls} role="alert">
          {displayError ?? i18n.genericError}
        </p>
      )}
    </form>
  );
}
