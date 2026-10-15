'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { TurnstileField } from '@/components/TurnstileField';

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

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} Mo` : `${Math.max(1, Math.round(bytes / 1024))} Ko`;
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

function post(form: FormData, onProgress: (pct: number) => void) {
  return new Promise<{ status: number; json: Record<string, unknown> | null }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/lemfi-contest/register');
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
  'mt-1.5 block min-h-12 w-full rounded-xl border bg-white px-4 text-base text-brand-dark placeholder:text-brand-dark/35 focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/40';

export function RegistrationForm() {
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
      setErrors((p) => ({ ...p, proof: 'Format non accepté. Utilisez une image JPG, PNG ou WebP.' }));
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrors((p) => ({ ...p, proof: 'Fichier trop lourd. La taille maximale est de 5 Mo.' }));
      return;
    }

    try {
      setPhase('preparing');
      const prepared = await shrinkImage(file);
      setOptimized(prepared !== file);
      setProof(prepared);
      setPreview(URL.createObjectURL(prepared));
    } catch {
      setErrors((p) => ({ ...p, proof: "Cette image n'a pas pu être lue. Essayez une autre capture." }));
    } finally {
      setPhase('idle');
    }
  }

  function validate(): Errors {
    const errs: Errors = {};
    if (!firstName.trim()) errs.firstName = 'Indiquez votre prénom.';
    if (!lastName.trim()) errs.lastName = 'Indiquez votre nom.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) errs.email = 'Indiquez une adresse e-mail valide.';
    if (!proof) errs.proof = 'Ajoutez la capture de confirmation du transfert.';
    if (!consent) errs.consent = 'Cochez cette case pour participer.';
    return errs;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy.current) return;
    setGlobalError('');

    const errs = validate();
    if (TURNSTILE_SITE_KEY && !captcha) {
      setGlobalError('Validez la vérification anti-robot avant d’envoyer.');
    }
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
      const { status, json } = await post(form, (pct) => {
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

      const message =
        typeof json?.error === 'string' && json.error
          ? json.error
          : "L'envoi a échoué. Vos informations sont conservées : réessayez dans un instant.";
      const field = json?.field as FieldKey | undefined;
      if (field && ['firstName', 'lastName', 'email', 'proof', 'consent'].includes(field)) {
        const fe: Errors = { [field]: message };
        setErrors(fe);
        focusFirst(fe);
      } else {
        setGlobalError(message);
      }
    } catch {
      setGlobalError('Connexion interrompue. Vos informations sont conservées : réessayez, vous ne serez pas inscrit(e) deux fois.');
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
      <div role="status" className="mt-5 rounded-2xl border border-primary/15 bg-white p-6 text-center shadow-sm">
        <p className="text-xl font-bold text-brand-dark">Inscriptions complètes</p>
      </div>
    );
  }

  if (success) return <SuccessPanel success={success} email={email} />;

  const sending = phase === 'uploading' || phase === 'saving';
  const fieldBorder = (k: FieldKey) => (errors[k] ? 'border-red-500' : 'border-primary/20');

  return (
    <form onSubmit={onSubmit} noValidate className="mt-5 space-y-5 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="lf-first" className="text-sm font-semibold text-brand-dark">
            Prénom
          </label>
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
            className={`${inputClass} ${fieldBorder('firstName')}`}
          />
          {errors.firstName && <p id="lf-first-err" className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lf-last" className="text-sm font-semibold text-brand-dark">
            Nom
          </label>
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
            className={`${inputClass} ${fieldBorder('lastName')}`}
          />
          {errors.lastName && <p id="lf-last-err" className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="lf-email" className="text-sm font-semibold text-brand-dark">
          Adresse e-mail
        </label>
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
          className={`${inputClass} ${fieldBorder('email')}`}
        />
        {errors.email && <p id="lf-email-err" className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      <div>
        <span id="lf-proof-label" className="text-sm font-semibold text-brand-dark">
          Capture de confirmation du transfert
        </span>
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
          <div className={`mt-1.5 rounded-xl border p-3 ${fieldBorder('proof')}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Aperçu de votre capture" className="mx-auto max-h-64 w-auto rounded-lg object-contain" />
            <p className="mt-2 truncate text-center text-xs text-brand-dark/60">
              {proof.name} · {formatSize(proof.size)}
              {optimized ? ' · image optimisée automatiquement' : ''}
            </p>
            <button
              type="button"
              ref={(el) => { fieldRefs.current.proof = el; }}
              onClick={() => fileInput.current?.click()}
              disabled={sending}
              className="mt-2 flex min-h-11 w-full items-center justify-center rounded-full border border-primary/30 text-sm font-semibold text-primary hover:bg-primary/5 disabled:opacity-50"
            >
              Remplacer le fichier
            </button>
          </div>
        ) : (
          <button
            type="button"
            ref={(el) => { fieldRefs.current.proof = el; }}
            onClick={() => fileInput.current?.click()}
            disabled={phase === 'preparing'}
            aria-describedby={errors.proof ? 'lf-proof-err' : undefined}
            className={`mt-1.5 flex min-h-28 w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed bg-primary/[0.03] px-4 py-5 text-center ${errors.proof ? 'border-red-500' : 'border-primary/30'}`}
          >
            <span className="text-base font-semibold text-primary">
              {phase === 'preparing' ? 'Préparation de l’image…' : 'Choisir ma capture d’écran'}
            </span>
            <span className="text-xs text-brand-dark/60">JPG, PNG ou WebP · 5 Mo maximum</span>
          </button>
        )}
        {errors.proof && <p id="lf-proof-err" className="mt-1 text-sm text-red-600">{errors.proof}</p>}
        <p className="mt-2 text-sm leading-snug text-brand-dark/75">
          Laissez visibles le montant, la date et la confirmation du transfert. Masquez votre solde et les
          informations sensibles.
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
            className="mt-0.5 h-6 w-6 shrink-0 accent-[#8C1A1A]"
          />
          <span className="text-sm leading-snug text-brand-dark/85">
            Je confirme que je serai présent(e) à Level Up in Germany, que je respecte les conditions du concours et
            que mes données seront utilisées pour gérer le concours.{' '}
            <a href="/fr/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary underline">
              Notice de confidentialité
            </a>
          </span>
        </label>
        {errors.consent && <p id="lf-consent-err" className="mt-1 text-sm text-red-600">{errors.consent}</p>}
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Site web
          <input name="website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      {TURNSTILE_SITE_KEY && <TurnstileField key={captchaKey} siteKey={TURNSTILE_SITE_KEY} onToken={setCaptcha} />}

      {globalError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
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
            className="h-2 overflow-hidden rounded-full bg-primary/10"
          >
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${phase === 'saving' ? 100 : progress}%` }} />
          </div>
          <p className="mt-2 text-center text-sm text-brand-dark/70">
            {phase === 'saving' ? 'Enregistrement de votre participation…' : `Envoi de votre capture… ${progress} %`}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={sending || phase === 'preparing'}
        className="flex min-h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-base font-bold text-white shadow transition hover:bg-primary-light focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? 'Envoi en cours…' : 'Envoyer ma participation'}
      </button>
    </form>
  );
}

function SuccessPanel({ success, email }: { success: Success; email: string }) {
  const [emailStatus, setEmailStatus] = useState<EmailStatus>(success.emailStatus);
  const [resending, setResending] = useState(false);
  const [resendNote, setResendNote] = useState('');
  const [copied, setCopied] = useState(false);

  async function resend() {
    setResending(true);
    setResendNote('');
    try {
      const res = await fetch('/api/lemfi-contest/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: success.token }),
      });
      const json = (await res.json()) as { ok?: boolean; emailStatus?: EmailStatus; error?: string };
      if (json.ok && json.emailStatus === 'sent') setEmailStatus('sent');
      else setResendNote(json.error ?? "L'e-mail n'a toujours pas pu être envoyé. Conservez votre numéro et votre lien.");
    } catch {
      setResendNote("L'e-mail n'a toujours pas pu être envoyé. Conservez votre numéro et votre lien.");
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
    <div role="status" className="mt-5 rounded-2xl border border-primary/15 bg-white p-5 text-center shadow-sm sm:p-7">
      <p className="text-base font-semibold text-brand-dark">Participation reçue.</p>
      <p className="mt-2 text-sm text-brand-dark/70">Votre numéro est</p>
      <p className="mt-1 font-display text-5xl font-bold tracking-wide text-primary">{success.number}</p>
      <p className="mt-4 text-base leading-relaxed text-brand-dark/85">
        Votre éligibilité au tirage sera confirmée après vérification de votre preuve.
      </p>

      {emailStatus === 'sent' ? (
        <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Un e-mail de confirmation a été envoyé à <strong className="[overflow-wrap:anywhere]">{email}</strong>.
        </p>
      ) : (
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-left text-sm text-amber-900">
          <p>
            Votre participation est bien enregistrée, mais l’e-mail de confirmation n’a pas pu être envoyé pour le
            moment. Notez votre numéro et conservez votre lien personnel ci-dessous.
          </p>
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="mt-3 flex min-h-11 w-full items-center justify-center rounded-full border border-amber-700/40 font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-60"
          >
            {resending ? 'Envoi…' : 'Renvoyer l’e-mail'}
          </button>
          {resendNote && <p className="mt-2 text-xs">{resendNote}</p>}
        </div>
      )}

      <div className="mt-5 text-left">
        <label htmlFor="lf-link" className="text-sm font-semibold text-brand-dark">
          Votre lien personnel de suivi
        </label>
        <div className="mt-1.5 flex gap-2">
          <input
            id="lf-link"
            readOnly
            value={success.trackUrl}
            onFocus={(e) => e.currentTarget.select()}
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-primary/20 bg-primary/[0.03] px-3 text-xs text-brand-dark"
          />
          <button
            type="button"
            onClick={copy}
            className="min-h-11 shrink-0 rounded-xl border border-primary/30 px-4 text-sm font-semibold text-primary hover:bg-primary/5"
          >
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
        <p className="mt-2 text-xs text-brand-dark/60">Ce lien est personnel : ne le partagez pas.</p>
      </div>

      <a
        href={success.trackUrl}
        className="mt-5 flex min-h-12 w-full items-center justify-center rounded-full bg-accent px-6 text-base font-bold text-brand-dark hover:bg-accent-light"
      >
        Suivre ma participation
      </a>
    </div>
  );
}
