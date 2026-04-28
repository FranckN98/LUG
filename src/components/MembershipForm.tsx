'use client';

import { useState } from 'react';

const HELP_DOMAINS = [
  'Design',
  'Logistique',
  'Aide le jour de l\'événement',
  'Création de contenu',
  'Marketing',
  'Communication',
  'Coordination',
  'Modération',
  'Sponsoring / Partenariats',
  'Gestion des invités',
  'Accueil des participants',
  'Technique / Audiovisuel',
  'Photographie / Vidéo',
  'Administration',
  'Finance / Trésorerie',
  'Autre',
];

type Locale = 'de' | 'en' | 'fr';

const LABELS: Record<Locale, {
  title: string;
  subtitle: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: string;
  email: string;
  phone: string;
  activityDomain: string;
  motivation: string;
  motivationPlaceholder: string;
  helpDomains: string;
  consent: string;
  submit: string;
  submitting: string;
  successTitle: string;
  successMsg: string;
  errorDuplicate: string;
  errorGeneric: string;
  required: string;
}> = {
  fr: {
    title: 'Devenir membre',
    subtitle: 'Rejoignez Level Up in Germany et contribuez à notre communauté.',
    firstName: 'Prénom *',
    lastName: 'Nom *',
    birthDate: 'Date de naissance *',
    address: 'Adresse complète *',
    email: 'Adresse email *',
    phone: 'Téléphone',
    activityDomain: 'Domaine d\'activité / domaine professionnel *',
    motivation: 'Motivation / courte présentation',
    motivationPlaceholder: 'Parlez-nous de vous et de vos motivations à rejoindre l\'association…',
    helpDomains: 'Comment souhaitez-vous aider l\'association ? *',
    consent: 'J\'ai lu et accepté les conditions de traitement et de sauvegarde de mes données personnelles.',
    submit: 'Envoyer ma demande',
    submitting: 'Envoi en cours…',
    successTitle: 'Demande envoyée !',
    successMsg: 'Votre demande d\'adhésion a bien été reçue. Nous l\'examinerons dans les plus brefs délais et vous contacterons par email.',
    errorDuplicate: 'Une demande avec cette adresse email existe déjà.',
    errorGeneric: 'Une erreur est survenue. Veuillez réessayer.',
    required: 'Veuillez sélectionner au moins un domaine d\'aide.',
  },
  en: {
    title: 'Become a member',
    subtitle: 'Join Level Up in Germany and contribute to our community.',
    firstName: 'First name *',
    lastName: 'Last name *',
    birthDate: 'Date of birth *',
    address: 'Full address *',
    email: 'Email address *',
    phone: 'Phone',
    activityDomain: 'Field of activity / professional domain *',
    motivation: 'Motivation / short presentation',
    motivationPlaceholder: 'Tell us about yourself and your motivation to join the association…',
    helpDomains: 'How would you like to help the association? *',
    consent: 'I have read and accepted the terms for processing and storing my personal data.',
    submit: 'Submit my application',
    submitting: 'Submitting…',
    successTitle: 'Application submitted!',
    successMsg: 'Your membership application has been received. We will review it shortly and contact you by email.',
    errorDuplicate: 'An application with this email address already exists.',
    errorGeneric: 'An error occurred. Please try again.',
    required: 'Please select at least one area where you\'d like to help.',
  },
  de: {
    title: 'Mitglied werden',
    subtitle: 'Werden Sie Teil von Level Up in Germany und tragen Sie zu unserer Gemeinschaft bei.',
    firstName: 'Vorname *',
    lastName: 'Nachname *',
    birthDate: 'Geburtsdatum *',
    address: 'Vollständige Adresse *',
    email: 'E-Mail-Adresse *',
    phone: 'Telefon',
    activityDomain: 'Tätigkeitsbereich / Berufsfeld *',
    motivation: 'Motivation / Kurzvorstellung',
    motivationPlaceholder: 'Erzählen Sie uns von sich und Ihrer Motivation, dem Verein beizutreten…',
    helpDomains: 'Wie möchten Sie den Verein unterstützen? *',
    consent: 'Ich habe die Bedingungen zur Verarbeitung und Speicherung meiner persönlichen Daten gelesen und akzeptiert.',
    submit: 'Bewerbung absenden',
    submitting: 'Wird gesendet…',
    successTitle: 'Bewerbung eingereicht!',
    successMsg: 'Ihre Mitgliedschaftsanfrage wurde erhalten. Wir werden sie in Kürze prüfen und Sie per E-Mail kontaktieren.',
    errorDuplicate: 'Eine Anfrage mit dieser E-Mail-Adresse existiert bereits.',
    errorGeneric: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    required: 'Bitte wählen Sie mindestens einen Bereich aus.',
  },
};

interface Props {
  locale: Locale;
}

export default function MembershipForm({ locale }: Props) {
  const t = LABELS[locale] ?? LABELS.fr;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    address: '',
    email: '',
    phone: '',
    activityDomain: '',
    motivation: '',
  });
  const [helpDomains, setHelpDomains] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function toggleDomain(domain: string) {
    setHelpDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain],
    );
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (helpDomains.length === 0) {
      setError(t.required);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/members/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, helpDomains, consentGiven: consent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          res.status === 409 ? t.errorDuplicate : data.error || t.errorGeneric,
        );
        return;
      }
      setSuccess(true);
    } catch {
      setError(t.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-accent/40 focus:outline-none transition-colors';
  const labelCls = 'block text-[11px] font-bold uppercase tracking-widest text-white/40 mb-1.5';

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20">
          <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{t.successTitle}</h3>
        <p className="text-sm text-white/60 max-w-md mx-auto">{t.successMsg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal info */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-accent/60">
          {locale === 'de' ? 'Persönliche Daten' : locale === 'en' ? 'Personal information' : 'Informations personnelles'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t.firstName}</label>
            <input type="text" required value={form.firstName} onChange={set('firstName')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.lastName}</label>
            <input type="text" required value={form.lastName} onChange={set('lastName')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.birthDate}</label>
            <input type="date" required value={form.birthDate} onChange={set('birthDate')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.phone}</label>
            <input type="tel" value={form.phone} onChange={set('phone')} className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>{t.address}</label>
            <input type="text" required value={form.address} onChange={set('address')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.email}</label>
            <input type="email" required value={form.email} onChange={set('email')} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>{t.activityDomain}</label>
            <input type="text" required value={form.activityDomain} onChange={set('activityDomain')} className={inputCls} />
          </div>
        </div>
      </div>

      {/* Motivation */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-3">
        <label className={labelCls}>{t.motivation}</label>
        <textarea
          value={form.motivation}
          onChange={set('motivation')}
          rows={4}
          placeholder={t.motivationPlaceholder}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Help domains */}
      <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-4">
        <p className={labelCls}>{t.helpDomains}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {HELP_DOMAINS.map((domain) => {
            const checked = helpDomains.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                onClick={() => toggleDomain(domain)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all ${
                  checked
                    ? 'border-accent/50 bg-accent/15 text-white'
                    : 'border-white/8 bg-white/3 text-white/50 hover:border-white/20 hover:text-white/80'
                }`}
              >
                <span className={`h-3.5 w-3.5 shrink-0 rounded border flex items-center justify-center ${checked ? 'border-accent bg-accent' : 'border-white/20'}`}>
                  {checked && (
                    <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 12 12">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
                {domain}
              </button>
            );
          })}
        </div>
      </div>

      {/* Consent */}
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/8 bg-white/3 p-4">
        <div className="relative mt-0.5 h-5 w-5 shrink-0">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="h-5 w-5 cursor-pointer rounded border border-white/20 bg-white/5 accent-accent"
          />
        </div>
        <span className="text-sm text-white/70 leading-relaxed">
          {t.consent}
        </span>
      </label>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !consent}
        className="w-full rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-white hover:bg-accent/80 disabled:opacity-50 transition-colors"
      >
        {submitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
