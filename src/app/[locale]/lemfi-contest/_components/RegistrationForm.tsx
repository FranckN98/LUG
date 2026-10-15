'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TurnstileField } from '@/components/TurnstileField';
import type { Locale } from '@/i18n/config';
import { getLemfiCopy, type LemfiErrorKey } from '@/content/lemfi-contest';

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? '';
const MAX_BYTES = 5 * 1024 * 1024;
// Les fonctions Vercel refusent les corps > 4,5 Mo : au-delà de 4 Mo l'image est réduite avant l'envoi.
const TARGET_BYTES = 4_000_000;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

type EmailStatus = 'sent' | 'failed' | 'not_configured';
type FieldKey = 'firstName' | 'lastName' | 'email' | 'proof' | 'consent';
type Errors = Partial<Record<FieldKey, string>>;
type Phase = 'idle' | 'preparing' | 'uploading' | 'saving';
type Success = { number: string; token: string; trackUrl: string; emailStatus: EmailStatus };

function makeSubmissionKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = new Uint8Array(18);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
}

function formatSize(bytes: number, locale: Locale): string {
  const unit = locale === 'fr' ? ['Ko', 'Mo'] : ['KB', 'MB'];
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} ${unit[1]}` : `${Math.max(1, Math.round(bytes / 1024))} ${unit[0]}`;
}

async function shrinkImage(file: File): Promise<File> {
  if (file.size <= TARGET_BYTES) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  for (const quality of [0.88, 0.8, 0.7, 0.6]) {
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', quality));
    if (blob && blob.size <= TARGET_BYTES) {
      return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    }
  }
  throw new Error('too_big');
}

function post(url: string, form: FormData, onProgress: (pct: number) => void) {
  return new Promise<{ status: number; json: Record<string, unknown> | null }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.timeout = 90_000;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      let json: Record<string, unknown> | null = null;
      try {
        json = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        /* réponse non JSON */
      }
      resolve({ status: xhr.status, json });
    };
    xhr.onerror = () => reject(new Error('network'));
    xhr.ontimeout = () => reject(new Error('timeout'));
    xhr.send(form);
  });
}

const inputClass =
  'mt-2 block min-h-[3.25rem] w-full rounded-2xl border bg-[#F4F1EB]/50 px-4 text-base text-[#04261A] placeholder:text-[#04261A]/35 transition focus:border-[#F5B800] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F5B800]/25';
const labelClass = 'text-sm font-semibold text-[#0A3D27]';
const cardClass =
  'mt-8 rounded-3xl bg-white p-5 shadow-[0_30px_80px_-34px_rgba(4,38,26,0.6)] ring-1 ring-[#0A3D27]/10 sm:p-8';

export function RegistrationForm({ locale }: { locale: Locale }) {
  const t = getLemfiCopy(locale);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [optimized, setOptimized] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [globalError, setGlobalError] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [full, setFull] = useState(false);
  const [success, setSuccess] = useState<Success | null>(null);

  const submissionKey = useRef(makeSubmissionKey());
  const busy = useRef(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const err = (key: LemfiErrorKey) => t.errors[key];

  const focusFirst = useCallback((errs: Errors) => {
    const first = (['firstName', 'lastName', 'email', 'proof', 'consent'] as FieldKey[]).find((k) => errs[k]);
    if (first) fieldRefs.current[first]?.focus();
  }, []);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setErrors((p) => ({ ...p, proof: undefined }));

    const okType = ACCEPTED.includes(file.type) || (!file.type && /\.(jpe?g|png|webp)$/i.test(file.name));
    if (!okType) {
      setErrors((p) => ({ ...p, proof: err('file_type') }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrors((p) => ({ ...p, proof: err('file_too_large') }));
      return;
    }

    try {
      setPhase('preparing');
      const prepared = await shrinkImage(file);
      setOptimized(prepared !== file);
      setProof(prepared);
      setPreview(URL.createObjectURL(prepared));
    } catch {
      setErrors((p) => ({ ...p, proof: err('image_unreadable') }));
    } finally {
      setPhase('idle');
    }
  }

  function validate(): Errors {
    const errs: Errors = {};
    if (!firstName.trim()) errs.firstName = err('first_name');
    if (!lastName.trim()) errs.lastName = err('last_name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = err('email');
    if (!proof) errs.proof = err('proof_required');
    if (!consent) errs.consent = err('consent');
    return errs;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    setGlobalError('');

    const errs = validate();
    if (TURNSTILE_SITE_KEY && !captcha) setGlobalError(err('captcha_required'));
    setErrors(errs);
    if (Object.keys(errs).length > 0 || !proof || (TURNSTILE_SITE_KEY && !captcha)) {
      focusFirst(errs);
      return;
    }

    busy.current = true;
    setPhase('uploading');
    setProgress(0);

    const form = new FormData();
    form.set('firstName', firstName);
    form.set('lastName', lastName);
    form.set('email', email);
    form.set('consent', 'true');
    form.set('submissionKey', submissionKey.current);
    form.set('website', honeypot);
    if (captcha) form.set('captchaToken', captcha);
    form.set('proof', proof);

    try {
      const { json } = await post(`/api/lemfi-contest/register?locale=${locale}`, form, (pct) => {
        setProgress(pct);
        if (pct >= 100) setPhase('saving');
      });

      if (json && json.ok === true) {
        setSuccess({
          number: String(json.number),
          token: String(json.token),
          trackUrl: String(json.trackUrl),
          emailStatus: json.emailStatus as EmailStatus,
        });
        return;
      }

      if (json?.code === 'full') {
        setFull(true);
        return;
      }

      const message = typeof json?.error === 'string' && json.error ? json.error : err('server_error');
      const field = json?.field as FieldKey | undefined;
      if (field && ['firstName', 'lastName', 'email', 'proof', 'consent'].includes(field)) {
        const fe: Errors = { [field]: message };
        setErrors(fe);
        focusFirst(fe);
      } else {
        setGlobalError(message);
      }
    } catch {
      setGlobalError(err('network'));
    } finally {
      busy.current = false;
      setPhase('idle');
      if (TURNSTILE_SITE_KEY) {
        setCaptcha(null);
        setCaptchaKey((k) => k + 1);
      }
    }
  }

  if (full) {
    return (
      <div role="status" className={`${cardClass} text-center`}>
        <p className="font-display text-3xl font-bold text-[#04261A]">{t.form.fullTitle}</p>
      </div>
    );
  }

  if (success) return <SuccessPanel success={success} email={email} locale={locale} />;

  const sending = phase === 'uploading' || phase === 'saving';
  const border = (k: FieldKey) => (errors[k] ? 'border-red-500' : 'border-[#0A3D27]/15');

  return (
    <form onSubmit={onSubmit} noValidate className={`${cardClass} relative space-y-6`}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-first" className={labelClass}>{t.form.firstName}</label>
          <input
            id="lf-first"
            ref={(el) => { fieldRefs.current.firstName = el; }}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            autoCapitalize="words"
            enterKeyHint="next"
            maxLength={60}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? 'lf-first-err' : undefined}
            className={`${inputClass} ${border('firstName')}`}
          />
          {errors.firstName && <p id="lf-first-err" className="mt-1.5 text-sm text-red-600">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lf-last" className={labelClass}>{t.form.lastName}</label>
          <input
            id="lf-last"
            ref={(el) => { fieldRefs.current.lastName = el; }}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            autoCapitalize="words"
            enterKeyHint="next"
            maxLength={60}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? 'lf-last-err' : undefined}
            className={`${inputClass} ${border('lastName')}`}
          />
          {errors.lastName && <p id="lf-last-err" className="mt-1.5 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="lf-email" className={labelClass}>{t.form.email}</label>
        <input
          id="lf-email"
          ref={(el) => { fieldRefs.current.email = el; }}
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          maxLength={254}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'lf-email-err' : undefined}
          className={`${inputClass} ${border('email')}`}
        />
        {errors.email && <p id="lf-email-err" className="mt-1.5 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <span id="lf-proof-label" className={labelClass}>{t.form.proofLabel}</span>
        <input
          ref={fileInput}
          id="lf-proof"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPickFile}
          className="sr-only"
          aria-labelledby="lf-proof-label"
          tabIndex={-1}
        />
        {preview && proof ? (
          <div className={`mt-2 rounded-2xl border bg-[#F4F1EB]/50 p-3 ${border('proof')}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={t.form.previewAlt} className="mx-auto max-h-64 w-auto rounded-xl object-contain shadow-sm" />
            <p className="mt-2 truncate text-center text-xs text-[#04261A]/60">
              {proof.name} · {formatSize(proof.size, locale)}
              {optimized ? ` · ${t.form.optimized}` : ''}
            </p>
            <button
              type="button"
              ref={(el) => { fieldRefs.current.proof = el; }}
              onClick={() => fileInput.current?.click()}
              disabled={sending}
              className="mt-2 flex min-h-11 w-full items-center justify-center rounded-full border border-[#0F5132]/30 text-sm font-semibold text-[#0F5132] transition hover:bg-[#0F5132]/5 disabled:opacity-50"
            >
              {t.form.replace}
            </button>
          </div>
        ) : (
          <button
            type="button"
            ref={(el) => { fieldRefs.current.proof = el; }}
            onClick={() => fileInput.current?.click()}
            disabled={phase === 'preparing'}
            aria-describedby={errors.proof ? 'lf-proof-err' : undefined}
            className={`mt-2 flex min-h-32 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed bg-[#5BC693]/10 px-4 py-6 text-center transition hover:bg-[#5BC693]/20 ${errors.proof ? 'border-red-500' : 'border-[#0F5132]/35'}`}
          >
            <svg className="h-7 w-7 text-[#0F5132]" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-base font-semibold text-[#0F5132]">
              {phase === 'preparing' ? t.form.preparing : t.form.pick}
            </span>
            <span className="text-xs text-[#04261A]/55">{t.form.hint}</span>
          </button>
        )}
        {errors.proof && <p id="lf-proof-err" className="mt-1.5 text-sm text-red-600">{errors.proof}</p>}
        <p className="mt-3 rounded-xl bg-[#F5B800]/10 px-3.5 py-2.5 text-sm leading-snug text-[#04261A]/80 ring-1 ring-[#F5B800]/30">
          {t.form.proofInstructions}
        </p>
      </div>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            ref={(el) => { fieldRefs.current.consent = el; }}
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={!!errors.consent}
            aria-describedby={errors.consent ? 'lf-consent-err' : undefined}
            className="mt-0.5 h-6 w-6 shrink-0 accent-[#0F5132]"
          />
          <span className="text-sm leading-snug text-[#04261A]/85">
            {t.form.consent}{' '}
            <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#0F5132] underline decoration-[#F5B800] decoration-2 underline-offset-2">
              {t.form.privacy}
            </a>
          </span>
        </label>
        {errors.consent && <p id="lf-consent-err" className="mt-1.5 text-sm text-red-600">{errors.consent}</p>}
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      {TURNSTILE_SITE_KEY && <TurnstileField key={captchaKey} siteKey={TURNSTILE_SITE_KEY} onToken={setCaptcha} />}

      {globalError && (
        <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
          {globalError}
        </p>
      )}

      {sending && (
        <div aria-live="polite">
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={phase === 'saving' ? 100 : progress}
            className="h-2 overflow-hidden rounded-full bg-[#0A3D27]/10"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FFE08A] to-[#F5B800] transition-all"
              style={{ width: `${phase === 'saving' ? 100 : progress}%` }}
            />
          </div>
          <p className="mt-2 text-center text-sm text-[#04261A]/70">
            {phase === 'saving' ? t.form.saving : t.form.uploading(progress)}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={sending || phase === 'preparing'}
        className="flex min-h-14 w-full items-center justify-center rounded-full bg-gradient-to-b from-[#FFE08A] to-[#F5B800] px-6 text-base font-bold text-[#04261A] shadow-[0_16px_36px_-14px_rgba(245,184,0,0.85)] transition hover:brightness-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F5B800]/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? t.form.sending : t.form.submit}
      </button>
    </form>
  );
}

function SuccessPanel({ success, email, locale }: { success: Success; email: string; locale: Locale }) {
  const t = getLemfiCopy(locale).success;
  const [emailStatus, setEmailStatus] = useState<EmailStatus>(success.emailStatus);
  const [resending, setResending] = useState(false);
  const [resendNote, setResendNote] = useState('');
  const [copied, setCopied] = useState(false);

  async function resend() {
    setResending(true);
    setResendNote('');
    try {
      const res = await fetch(`/api/lemfi-contest/resend?locale=${locale}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: success.token }),
      });
      const json = (await res.json()) as { ok?: boolean; emailStatus?: EmailStatus; error?: string };
      if (json.ok && json.emailStatus === 'sent') setEmailStatus('sent');
      else setResendNote(json.error ?? t.resendFailed);
    } catch {
      setResendNote(t.resendFailed);
    } finally {
      setResending(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(success.trackUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* copie manuelle possible depuis le champ */
    }
  }

  return (
    <div
      role="status"
      className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#04261A] via-[#0A3D27] to-[#0F5132] p-6 text-center text-white shadow-[0_30px_80px_-30px_rgba(4,38,26,0.8)] ring-1 ring-[#F5B800]/40 sm:p-9"
    >
      <p className="text-base font-semibold text-[#FFE08A]">{t.received}</p>
      <p className="mt-4 text-sm text-white/70">{t.numberIs}</p>
      <p className="mt-1 bg-gradient-to-b from-[#FFE08A] to-[#F5B800] bg-clip-text font-display text-7xl font-bold tracking-wide text-transparent lining-nums">
        {success.number}
      </p>
      <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-white/85">{t.eligibility}</p>

      {emailStatus === 'sent' ? (
        <p className="mt-5 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/90 ring-1 ring-white/15">
          {t.emailSent(email)}
        </p>
      ) : (
        <div className="mt-5 rounded-2xl bg-[#F5B800]/15 px-4 py-3 text-left text-sm text-[#FFE08A] ring-1 ring-[#F5B800]/40">
          <p>{t.emailFailed}</p>
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-full border border-[#F5B800]/60 font-semibold text-[#FFE08A] transition hover:bg-[#F5B800]/15 disabled:opacity-60"
          >
            {resending ? t.resending : t.resend}
          </button>
          {resendNote && <p className="mt-2 text-xs">{resendNote}</p>}
        </div>
      )}

      <div className="mt-6 text-left">
        <label htmlFor="lf-link" className="text-sm font-semibold text-white/90">{t.linkLabel}</label>
        <div className="mt-2 flex gap-2">
          <input
            id="lf-link"
            readOnly
            value={success.trackUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/20 bg-black/20 px-3 text-xs text-white"
          />
          <button
            type="button"
            onClick={copy}
            className="min-h-11 shrink-0 rounded-xl border border-white/25 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {copied ? t.copied : t.copy}
          </button>
        </div>
        <p className="mt-2 text-xs text-white/60">{t.personalNote}</p>
      </div>

      <a
        href={success.trackUrl}
        className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-gradient-to-b from-[#FFE08A] to-[#F5B800] px-6 text-base font-bold text-[#04261A] transition hover:brightness-105"
      >
        {t.track}
      </a>
    </div>
  );
}
