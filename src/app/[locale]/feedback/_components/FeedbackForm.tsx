'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FEEDBACK_LIMITS, feedbackCopy as t } from '@/content/feedback';

type FieldKey =
  | 'rating'
  | 'highlights'
  | 'likesAndImprovements'
  | 'wantedSpeakers'
  | 'wantedTopics'
  | 'firstName'
  | 'lastName'
  | 'newsEmail'
  | 'newsFirstName'
  | 'newsLastName'
  | 'code';
type Errors = Partial<Record<FieldKey, string>>;

// Ordre d'affichage : sert à placer le focus sur la première erreur.
const FIELD_ORDER: FieldKey[] = [
  'rating',
  'highlights',
  'likesAndImprovements',
  'wantedSpeakers',
  'wantedTopics',
  'firstName',
  'lastName',
  'newsEmail',
  'newsFirstName',
  'newsLastName',
  'code',
];

const inputCls =
  'mt-2 block w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-base text-brand-dark placeholder:text-gray-400 transition focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 aria-[invalid=true]:border-red-500';
const textareaCls = `${inputCls} min-h-[7.5rem] resize-y leading-relaxed`;

function focusField(key: FieldKey) {
  const el = document.getElementById(key === 'rating' ? 'fb-rating-1' : `fb-${key}`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  (el as HTMLElement | null)?.focus({ preventScroll: true });
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-9 w-9 sm:h-11 sm:w-11" aria-hidden="true">
      <path
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function QuestionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <span className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
      >
        {n}
      </span>
      <span className="block text-lg font-semibold leading-snug text-brand-dark sm:text-xl">{children}</span>
    </span>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  if (value.length < max * 0.8) return null;
  return <p className="mt-1 text-right text-xs text-gray-500">{value.length} / {max}</p>;
}

export function FeedbackForm({ homeHref }: { homeHref: string }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [highlights, setHighlights] = useState('');
  const [likes, setLikes] = useState('');
  const [speakers, setSpeakers] = useState('');
  const [topics, setTopics] = useState('');
  const [sign, setSign] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [news, setNews] = useState(false);
  const [newsEmail, setNewsEmail] = useState('');
  const [newsFirstName, setNewsFirstName] = useState('');
  const [newsLastName, setNewsLastName] = useState('');
  const [code, setCode] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle');
  const [newsletterFailed, setNewsletterFailed] = useState(false);

  // Le code arrive dans le lien personnel : on le lit puis on le retire de la barre d'adresse et de l'historique.
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('code');
    if (fromUrl) {
      setCode(fromUrl.slice(0, 20));
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  const answered = [rating > 0, !!highlights.trim(), !!likes.trim(), !!(speakers.trim() || topics.trim())].filter(Boolean).length;

  const showErrors = (next: Errors) => {
    setErrors(next);
    const first = FIELD_ORDER.find((k) => next[k]);
    if (first) requestAnimationFrame(() => focusField(first));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === 'sending') return;

    const next: Errors = {};
    if (!rating) next.rating = t.errors.rating;
    if (news && !/^\S+@\S+\.\S+$/.test(newsEmail.trim())) next.newsEmail = t.errors.email;
    if (!code.trim()) next.code = t.errors.code;
    setFormError('');
    if (Object.keys(next).length > 0) return showErrors(next);

    setErrors({});
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify({
          code,
          rating,
          highlights,
          likesAndImprovements: likes,
          wantedSpeakers: speakers,
          wantedTopics: topics,
          sign,
          firstName: sign ? firstName : '',
          lastName: sign ? lastName : '',
          news,
          newsEmail: news ? newsEmail : '',
          newsFirstName: news ? newsFirstName : '',
          newsLastName: news ? newsLastName : '',
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; field?: FieldKey; newsletter?: string };
      if (res.ok) {
        setNewsletterFailed(data.newsletter === 'failed');
        setStatus('done');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setStatus('idle');
      if (data.field && FIELD_ORDER.includes(data.field)) showErrors({ [data.field]: data.error ?? t.errors.generic });
      else setFormError(data.error ?? t.errors.generic);
    } catch {
      setStatus('idle');
      setFormError(t.errors.generic);
    }
  }

  if (status === 'done') {
    return (
      <div
        role="status"
        className="rounded-3xl bg-white p-8 text-center shadow-[0_30px_80px_-30px_rgba(110,20,20,0.45)] ring-1 ring-primary/10 sm:p-12"
      >
        <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <p className="mt-6 font-display text-3xl font-bold leading-snug text-primary sm:text-4xl">{t.success}</p>
        {newsletterFailed && (
          <p className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">{t.newsletterFailed}</p>
        )}
        <Link
          href={homeHref}
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full border border-primary/25 px-6 text-sm font-semibold text-primary transition hover:bg-primary/5"
        >
          Retour à l’accueil
        </Link>
      </div>
    );
  }

  const describedBy = (k: FieldKey) => (errors[k] ? `fb-${k}-error` : undefined);

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      autoComplete="off"
      className="rounded-3xl bg-white shadow-[0_30px_80px_-30px_rgba(110,20,20,0.45)] ring-1 ring-primary/10"
    >
      <div className="sticky top-16 z-20 rounded-t-3xl border-b border-gray-100 bg-white/95 px-5 py-3 backdrop-blur sm:top-20 sm:px-8 md:top-[5.5rem]">
        <div
          role="progressbar"
          aria-label={t.progress.label}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-valuenow={answered}
          className="h-1 overflow-hidden rounded-full bg-primary/10"
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
            style={{ width: `${(answered / 4) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[11px] font-medium tracking-wide text-gray-500">
          {t.progress.label} · {answered} {t.progress.of} 4
        </p>
      </div>

      <div className="space-y-10 px-5 pb-8 pt-7 sm:px-8 sm:pb-10">
        {/* 1 — Note */}
        <fieldset aria-describedby={describedBy('rating')}>
          <legend className="w-full">
            <QuestionTitle n={1}>{t.rating.question}</QuestionTitle>
          </legend>
          <div className="mt-4 sm:pl-10">
            <div className="flex items-center gap-0.5 sm:gap-1.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <label key={n} className="cursor-pointer" onMouseEnter={() => setHover(n)}>
                  <input
                    type="radio"
                    name="rating"
                    id={`fb-rating-${n}`}
                    value={n}
                    checked={rating === n}
                    onChange={() => {
                      setRating(n);
                      setErrors((x) => ({ ...x, rating: undefined }));
                    }}
                    aria-label={t.rating.star(n)}
                    className="peer sr-only"
                  />
                  <span
                    className={`block rounded-full p-1 transition peer-focus-visible:ring-4 peer-focus-visible:ring-accent/40 ${
                      n <= (hover || rating) ? 'scale-110 text-accent' : 'text-gray-300 hover:text-accent/60'
                    }`}
                  >
                    <Star filled={n <= (hover || rating)} />
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-1 flex justify-between text-xs font-medium text-gray-500 sm:max-w-[19.5rem]">
              <span>{t.rating.low}</span>
              <span>{t.rating.high}</span>
            </div>
            <FieldError id="fb-rating-error" message={errors.rating} />
          </div>
        </fieldset>

        {/* 2 */}
        <div>
          <label htmlFor="fb-highlights">
            <QuestionTitle n={2}>{t.highlights.question}</QuestionTitle>
          </label>
          <div className="sm:pl-10">
            <textarea
              id="fb-highlights"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              maxLength={FEEDBACK_LIMITS.longText}
              placeholder={t.highlights.placeholder}
              aria-invalid={!!errors.highlights}
              aria-describedby={describedBy('highlights')}
              className={textareaCls}
            />
            <Counter value={highlights} max={FEEDBACK_LIMITS.longText} />
            <FieldError id="fb-highlights-error" message={errors.highlights} />
          </div>
        </div>

        {/* 3 */}
        <div>
          <label htmlFor="fb-likesAndImprovements">
            <QuestionTitle n={3}>{t.improvements.question}</QuestionTitle>
          </label>
          <div className="sm:pl-10">
            <textarea
              id="fb-likesAndImprovements"
              value={likes}
              onChange={(e) => setLikes(e.target.value)}
              maxLength={FEEDBACK_LIMITS.longText}
              placeholder={t.improvements.placeholder}
              aria-invalid={!!errors.likesAndImprovements}
              aria-describedby={describedBy('likesAndImprovements')}
              className={textareaCls}
            />
            <Counter value={likes} max={FEEDBACK_LIMITS.longText} />
            <FieldError id="fb-likesAndImprovements-error" message={errors.likesAndImprovements} />
          </div>
        </div>

        {/* 4 */}
        <fieldset>
          <legend className="w-full">
            <QuestionTitle n={4}>{t.wishes.question}</QuestionTitle>
          </legend>
          <div className="mt-2 space-y-4 sm:pl-10">
            <div>
              <label htmlFor="fb-wantedSpeakers" className="text-sm font-semibold text-gray-700">
                {t.wishes.speakers}
              </label>
              <textarea
                id="fb-wantedSpeakers"
                value={speakers}
                onChange={(e) => setSpeakers(e.target.value)}
                maxLength={FEEDBACK_LIMITS.shortText}
                rows={2}
                aria-invalid={!!errors.wantedSpeakers}
                aria-describedby={describedBy('wantedSpeakers')}
                className={`${inputCls} min-h-[4.5rem] resize-y leading-relaxed`}
              />
              <Counter value={speakers} max={FEEDBACK_LIMITS.shortText} />
              <FieldError id="fb-wantedSpeakers-error" message={errors.wantedSpeakers} />
            </div>
            <div>
              <label htmlFor="fb-wantedTopics" className="text-sm font-semibold text-gray-700">
                {t.wishes.topics}
              </label>
              <textarea
                id="fb-wantedTopics"
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                maxLength={FEEDBACK_LIMITS.shortText}
                rows={2}
                aria-invalid={!!errors.wantedTopics}
                aria-describedby={describedBy('wantedTopics')}
                className={`${inputCls} min-h-[4.5rem] resize-y leading-relaxed`}
              />
              <Counter value={topics} max={FEEDBACK_LIMITS.shortText} />
              <FieldError id="fb-wantedTopics-error" message={errors.wantedTopics} />
            </div>
          </div>
        </fieldset>

        {/* Signature facultative */}
        <div className="rounded-2xl bg-[#FBF7F4] p-5 ring-1 ring-gray-200/80">
          <label className="flex cursor-pointer items-start gap-3">
            <span className="relative mt-0.5 inline-flex h-6 w-11 shrink-0">
              <input
                type="checkbox"
                role="switch"
                checked={sign}
                onChange={(e) => setSign(e.target.checked)}
                className="peer sr-only"
              />
              <span className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-primary peer-focus-visible:ring-4 peer-focus-visible:ring-primary/25" />
              <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
            </span>
            <span>
              <span className="block font-semibold text-brand-dark">{t.sign.toggle}</span>
              <span className="block text-sm text-gray-500">{t.sign.hint}</span>
            </span>
          </label>

          {sign && (
            <div className="mt-4 space-y-4">
              <p
                role="note"
                className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 ring-1 ring-amber-200"
              >
                {t.sign.warning}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fb-firstName" className="text-sm font-semibold text-gray-700">
                    {t.sign.firstName} <span className="font-normal text-gray-400">({t.sign.optional})</span>
                  </label>
                  <input
                    id="fb-firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    maxLength={FEEDBACK_LIMITS.name}
                    autoComplete="off"
                    aria-invalid={!!errors.firstName}
                    aria-describedby={describedBy('firstName')}
                    className={inputCls}
                  />
                  <FieldError id="fb-firstName-error" message={errors.firstName} />
                </div>
                <div>
                  <label htmlFor="fb-lastName" className="text-sm font-semibold text-gray-700">
                    {t.sign.lastName} <span className="font-normal text-gray-400">({t.sign.optional})</span>
                  </label>
                  <input
                    id="fb-lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    maxLength={FEEDBACK_LIMITS.name}
                    autoComplete="off"
                    aria-invalid={!!errors.lastName}
                    aria-describedby={describedBy('lastName')}
                    className={inputCls}
                  />
                  <FieldError id="fb-lastName-error" message={errors.lastName} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rester en contact — section séparée et facultative */}
        <section aria-labelledby="fb-contact-title" className="rounded-2xl border border-accent/40 bg-accent/[0.07] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 id="fb-contact-title" className="font-display text-2xl font-bold text-primary">
              {t.contact.title}
            </h2>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-accent-dark ring-1 ring-accent/40">
              {t.contact.optionalBadge}
            </span>
          </div>
          <p className="mt-2 font-semibold text-brand-dark">{t.contact.question}</p>

          <label className="mt-4 flex cursor-pointer items-center gap-3 text-brand-dark">
            <input
              type="checkbox"
              checked={news}
              onChange={(e) => setNews(e.target.checked)}
              className="h-5 w-5 shrink-0 rounded border-gray-300 accent-primary"
            />
            <span>{t.contact.checkbox}</span>
          </label>

          {news && (
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="fb-newsEmail" className="text-sm font-semibold text-gray-700">
                  {t.contact.email}
                </label>
                <input
                  id="fb-newsEmail"
                  type="email"
                  inputMode="email"
                  value={newsEmail}
                  onChange={(e) => setNewsEmail(e.target.value)}
                  maxLength={FEEDBACK_LIMITS.email}
                  autoComplete="email"
                  aria-invalid={!!errors.newsEmail}
                  aria-describedby={describedBy('newsEmail')}
                  className={inputCls}
                />
                <FieldError id="fb-newsEmail-error" message={errors.newsEmail} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="fb-newsFirstName" className="text-sm font-semibold text-gray-700">
                    {t.contact.firstName} <span className="font-normal text-gray-400">({t.contact.optional})</span>
                  </label>
                  <input
                    id="fb-newsFirstName"
                    value={newsFirstName}
                    onChange={(e) => setNewsFirstName(e.target.value)}
                    maxLength={FEEDBACK_LIMITS.name}
                    autoComplete="given-name"
                    aria-invalid={!!errors.newsFirstName}
                    aria-describedby={describedBy('newsFirstName')}
                    className={inputCls}
                  />
                  <FieldError id="fb-newsFirstName-error" message={errors.newsFirstName} />
                </div>
                <div>
                  <label htmlFor="fb-newsLastName" className="text-sm font-semibold text-gray-700">
                    {t.contact.lastName} <span className="font-normal text-gray-400">({t.contact.optional})</span>
                  </label>
                  <input
                    id="fb-newsLastName"
                    value={newsLastName}
                    onChange={(e) => setNewsLastName(e.target.value)}
                    maxLength={FEEDBACK_LIMITS.name}
                    autoComplete="family-name"
                    aria-invalid={!!errors.newsLastName}
                    aria-describedby={describedBy('newsLastName')}
                    className={inputCls}
                  />
                  <FieldError id="fb-newsLastName-error" message={errors.newsLastName} />
                </div>
              </div>
            </div>
          )}

          <p className="mt-4 text-sm leading-relaxed text-gray-600">{t.contact.privacy}</p>
        </section>

        {/* Code à usage unique + envoi */}
        <div>
          <label htmlFor="fb-code" className="font-semibold text-brand-dark">
            {t.code.label}
          </label>
          <input
            id="fb-code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setErrors((x) => ({ ...x, code: undefined }));
            }}
            maxLength={20}
            placeholder={t.code.placeholder}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={!!errors.code}
            aria-describedby={`fb-code-help${errors.code ? ' fb-code-error' : ''}`}
            className={`${inputCls} max-w-xs font-mono uppercase tracking-widest`}
          />
          <p id="fb-code-help" className="mt-1.5 text-sm text-gray-500">
            {t.code.help}
          </p>
          <FieldError id="fb-code-error" message={errors.code} />
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-primary px-8 text-lg font-bold text-white shadow-lg shadow-primary/30 transition hover:bg-primary-light focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 disabled:cursor-wait disabled:opacity-70"
        >
          {status === 'sending' ? t.sending : t.submit}
        </button>
      </div>
    </form>
  );
}
