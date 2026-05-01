'use client';

import { useEffect, useRef, useState } from 'react';

type Locale = 'de' | 'en' | 'fr';

export type EventCommunicationPopupData = {
  id?: string;
  eventId: string;
  title: string;
  description: string;
  buttonText: string;
  imageUrl: string | null;
  eventTitle?: string;
  eventYear?: number;
  updatedAt?: string;
};

type Props = {
  locale: Locale;
  data: EventCommunicationPopupData;
  open: boolean;
  previewMode?: boolean;
  display?: 'hero' | 'modal';
  onClose: () => void;
};

const copy = {
  fr: {
    eyebrow: 'Événements à venir',
    firstName: 'Prénom',
    email: 'Votre adresse e-mail',
    success: 'Merci, tu es bien inscrit. Tu recevras les prochaines informations en priorité.',
    submitting: 'Inscription...',
    requiredEmail: 'Veuillez entrer une adresse email valide.',
    genericError: 'Impossible de vous inscrire pour le moment.',
    previewNote: 'Aperçu admin',
    consentPrefix: "J'ai lu et j'accepte la ",
    consentLink: 'politique de confidentialité',
    consentSuffix: ' concernant le traitement de mes données personnelles.',
  },
  en: {
    eyebrow: 'Upcoming events',
    firstName: 'First name',
    email: 'Your email address',
    success: 'Thanks, you are on the list. You will receive the next updates first.',
    submitting: 'Joining...',
    requiredEmail: 'Please enter a valid email address.',
    genericError: 'Unable to subscribe right now.',
    previewNote: 'Admin preview',
    consentPrefix: 'I have read and accept the ',
    consentLink: 'privacy policy',
    consentSuffix: ' regarding the processing of my personal data.',
  },
  de: {
    eyebrow: 'Kommende Events',
    firstName: 'Vorname',
    email: 'Ihre E-Mail-Adresse',
    success: 'Danke, Sie sind eingetragen. Sie erhalten die nächsten Infos priorisiert.',
    submitting: 'Anmeldung...',
    requiredEmail: 'Bitte eine gültige E-Mail-Adresse eingeben.',
    genericError: 'Anmeldung aktuell nicht möglich.',
    previewNote: 'Admin-Vorschau',
    consentPrefix: 'Ich habe die ',
    consentLink: 'Datenschutzerklärung',
    consentSuffix: ' gelesen und stimme der Verarbeitung meiner personenbezogenen Daten zu.',
  },
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EventCommunicationPopup({ locale, data, open, previewMode = false, display = 'hero', onClose }: Props) {
  const t = copy[locale];
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setFirstName('');
      setEmail('');
      setConsent(false);
      setSubmitting(false);
      setSuccess(false);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!EMAIL_RE.test(email.trim())) {
      setError(t.requiredEmail);
      return;
    }
    if (!consent) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (previewMode) {
        await new Promise((resolve) => window.setTimeout(resolve, 350));
      } else {
        const res = await fetch('/api/communication/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: data.eventId,
            firstName,
            email,
          }),
        });

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          if (body?.error === 'invalid_email') {
            throw new Error(t.requiredEmail);
          }
          throw new Error(t.genericError);
        }
      }

      setSuccess(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  const isHeroDisplay = display === 'hero';

  return (
    <div
      className={isHeroDisplay
        ? 'fixed inset-x-0 top-[4.5rem] bottom-0 z-[90] flex justify-center overflow-y-auto px-3 pb-4 pt-2 sm:top-[5.8rem] sm:px-4'
        : 'fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-[#100706]/55 px-3 py-4 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6'}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={isHeroDisplay
          ? 'relative my-auto w-full max-w-5xl overflow-hidden rounded-2xl bg-gradient-to-br from-[#120909] via-[#22110f] to-[#2a1412] shadow-[0_26px_70px_rgba(0,0,0,0.45)] ring-1 ring-accent/20 animate-[fadeIn_.28s_ease] sm:rounded-[2rem]'
          : 'relative w-full max-w-5xl overflow-hidden rounded-2xl bg-[#f6f1ea] shadow-[0_24px_80px_rgba(0,0,0,0.28)] ring-1 ring-black/5 animate-[fadeIn_.28s_ease] sm:rounded-[2rem]'}
      >
        <button
          type="button"
          onClick={onClose}
          className={isHeroDisplay
            ? 'absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white shadow-md backdrop-blur transition hover:bg-white/20 sm:right-5 sm:top-5 sm:h-11 sm:w-11 sm:bg-white/10'
            : 'absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/95 text-[#0a5b57] shadow-md transition hover:bg-white sm:right-5 sm:top-5 sm:h-11 sm:w-11'}
          aria-label="Close"
        >
          <span className="text-2xl leading-none">×</span>
        </button>

        <div className="grid md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative h-32 bg-[#083a35] sm:h-48 md:h-auto md:min-h-[250px]">
            {data.imageUrl ? (
              <img src={data.imageUrl} alt={data.eventTitle ?? ''} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-end bg-[radial-gradient(circle_at_20%_20%,rgba(233,140,11,0.24),transparent_40%),linear-gradient(135deg,#06352f,#0d5c55_55%,#ab1a10)] p-5 sm:p-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60 sm:text-xs sm:tracking-[0.34em]">Level Up</p>
                  <p className="mt-2 max-w-xs text-xl font-semibold leading-tight text-white sm:mt-3 sm:text-3xl">{data.eventTitle ?? 'Upcoming event'}</p>
                  {data.eventYear ? <p className="mt-1 text-sm text-white/70 sm:mt-2 sm:text-base">{data.eventYear}</p> : null}
                </div>
              </div>
            )}
            {previewMode ? (
              <span className="absolute left-3 top-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 sm:left-5 sm:top-5 sm:px-3 sm:text-[11px] sm:tracking-[0.24em]">
                {t.previewNote}
              </span>
            ) : null}
          </div>

          <div className={isHeroDisplay ? 'flex flex-col justify-center px-5 py-6 text-white sm:px-10 sm:py-10' : 'flex flex-col justify-center px-5 py-6 sm:px-10 sm:py-10'}>
            <span className={isHeroDisplay
              ? 'inline-flex w-fit rounded-full bg-accent/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-dark sm:px-5 sm:py-2 sm:text-xs sm:tracking-[0.24em]'
              : 'inline-flex w-fit rounded-full bg-[#0a5b57] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/85 sm:px-5 sm:py-2 sm:text-xs sm:tracking-[0.24em]'}>
              {t.eyebrow}
            </span>
            <h3 className={isHeroDisplay
              ? 'mt-4 max-w-xl text-2xl font-semibold leading-[1.12] text-white sm:mt-6 sm:text-4xl sm:leading-[1.08] md:text-5xl'
              : 'mt-4 max-w-xl text-2xl font-semibold leading-[1.12] text-[#2f231c] sm:mt-6 sm:text-4xl sm:leading-[1.08] md:text-5xl'}>
              {data.title}
            </h3>
            <p className={isHeroDisplay
              ? 'mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:mt-5 sm:text-lg'
              : 'mt-3 max-w-lg text-sm leading-relaxed text-[#0a5b57]/78 sm:mt-5 sm:text-lg'}>
              {data.description}
            </p>

            {success ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-relaxed text-emerald-800 sm:mt-8 sm:px-5 sm:py-4">
                {t.success}
              </div>
            ) : (
              <form className="mt-5 space-y-3 sm:mt-8 sm:space-y-4" onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  placeholder={t.firstName}
                  className={isHeroDisplay
                    ? 'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/55 outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/15 sm:rounded-2xl sm:px-5 sm:py-4'
                    : 'w-full rounded-xl border border-[#d9cec2] bg-white px-4 py-3 text-base text-[#2f231c] outline-none transition focus:border-[#0a5b57] focus:ring-4 focus:ring-[#0a5b57]/10 sm:rounded-2xl sm:px-5 sm:py-4'}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t.email}
                  className={isHeroDisplay
                    ? 'w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/55 outline-none transition focus:border-accent/70 focus:ring-4 focus:ring-accent/15 sm:rounded-2xl sm:px-5 sm:py-4'
                    : 'w-full rounded-xl border border-[#d9cec2] bg-white px-4 py-3 text-base text-[#2f231c] outline-none transition focus:border-[#0a5b57] focus:ring-4 focus:ring-[#0a5b57]/10 sm:rounded-2xl sm:px-5 sm:py-4'}
                  required
                />
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                <label className={isHeroDisplay
                  ? 'flex items-start gap-2 text-xs leading-snug text-white/75 sm:gap-3 sm:text-sm'
                  : 'flex items-start gap-2 text-xs leading-snug text-[#0a5b57]/80 sm:gap-3 sm:text-sm'}>
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    aria-required="true"
                    className={isHeroDisplay
                      ? 'mt-1 h-4 w-4 shrink-0 rounded border-white/30 bg-white/10 text-accent focus:ring-accent focus:ring-offset-0'
                      : 'mt-1 h-4 w-4 shrink-0 rounded border-[#d9cec2] bg-white text-[#0a5b57] focus:ring-[#0a5b57] focus:ring-offset-0'}
                  />
                  <span>
                    {t.consentPrefix}
                    <a
                      href={`/${locale}/privacy`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isHeroDisplay
                        ? 'text-accent underline underline-offset-2 hover:text-accent-light'
                        : 'text-[#0a5b57] underline underline-offset-2 hover:text-[#084844]'}
                    >
                      {t.consentLink}
                    </a>
                    {t.consentSuffix}
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={submitting || !consent}
                  className={isHeroDisplay
                    ? 'inline-flex w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-base font-semibold text-brand-dark transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-lg'
                    : 'inline-flex w-full items-center justify-center rounded-xl bg-[#0a5b57] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#084844] disabled:cursor-not-allowed disabled:opacity-60 sm:rounded-2xl sm:px-6 sm:py-4 sm:text-lg'}
                >
                  {submitting ? t.submitting : data.buttonText}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}