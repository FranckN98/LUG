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
  consentLink: string;
  consentSuffix: string;
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
    consent: "J'ai lu et j'accepte la ",
    consentLink: 'politique de confidentialité',
    consentSuffix: ' concernant le traitement de mes données personnelles.',
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
    consent: 'I have read and accept the ',
    consentLink: 'privacy policy',
    consentSuffix: ' regarding the processing of my personal data.',
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
    consent: 'Ich habe die ',
    consentLink: 'Datenschutzerklärung',
    consentSuffix: ' gelesen und stimme der Verarbeitung meiner personenbezogenen Daten zu.',
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
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#8c1a1a] focus:ring-2 focus:ring-[#8c1a1a]/10 focus:outline-none transition-all';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5';

  const sectionCls = 'rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4';
  const sectionHeadCls = 'flex items-center gap-2 pb-1 border-b border-gray-100 mb-2';
  const sectionIconCls = 'inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#8c1a1a]/10 shrink-0';
  const sectionTitleCls = 'text-xs font-bold uppercase tracking-widest text-[#8c1a1a]';

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center shadow-sm">
        <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.successTitle}</h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">{t.successMsg}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal info */}
      <div className={sectionCls}>
        <div className={sectionHeadCls}>
          <span className={sectionIconCls}>
            <svg className="w-3.5 h-3.5 text-[#8c1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <p className={sectionTitleCls}>
            {locale === 'de' ? 'Persönliche Daten' : locale === 'en' ? 'Personal information' : 'Informations personnelles'}
          </p>
        </div>
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
            <input type="date" required value={form.birthDate} onChange={set('birthDate')} className={`${inputCls} text-gray-700`} />
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
      <div className={sectionCls}>
        <div className={sectionHeadCls}>
          <span className={sectionIconCls}>
            <svg className="w-3.5 h-3.5 text-[#8c1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <p className={sectionTitleCls}>{t.motivation}</p>
        </div>
        <textarea
          value={form.motivation}
          onChange={set('motivation')}
          rows={4}
          placeholder={t.motivationPlaceholder}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Help domains */}
      <div className={sectionCls}>
        <div className={sectionHeadCls}>
          <span className={sectionIconCls}>
            <svg className="w-3.5 h-3.5 text-[#8c1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </span>
          <p className={sectionTitleCls}>{t.helpDomains}</p>
        </div>
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
                    ? 'border-[#8c1a1a]/40 bg-[#8c1a1a]/8 text-[#8c1a1a] shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-[#8c1a1a]/30 hover:bg-[#8c1a1a]/5 hover:text-gray-800'
                }`}
              >
                <span className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                  checked ? 'border-[#8c1a1a] bg-[#8c1a1a]' : 'border-gray-300 bg-white'
                }`}>
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 12 12">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
                {domain}
              </button>
            );
          })}
        </div>
        {helpDomains.length > 0 && (
          <p className="text-xs font-semibold text-[#8c1a1a]">
            {helpDomains.length} domaine{helpDomains.length > 1 ? 's' : ''} sélectionné{helpDomains.length > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Consent */}
      <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 shadow-sm transition-colors ${
        consent ? 'border-[#8c1a1a]/30 bg-[#8c1a1a]/5' : 'border-gray-200 bg-white hover:border-gray-300'
      }`}>
        <div className="mt-0.5 shrink-0">
          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
            consent ? 'border-[#8c1a1a] bg-[#8c1a1a]' : 'border-gray-300 bg-white'
          }`}>
            {consent && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 12 12">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2 6l3 3 5-5" />
              </svg>
            )}
          </div>
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="sr-only"
          />
        </div>
        <span className="text-sm text-gray-700 leading-relaxed">
          {t.consent}
          <a
            href={`/${locale}/privacy`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[#8c1a1a] underline underline-offset-2 hover:text-[#a52020]"
          >
            {t.consentLink}
          </a>
          {t.consentSuffix}
        </span>
      </label>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !consent}
        className="w-full rounded-xl bg-[#8c1a1a] px-6 py-4 text-sm font-bold text-white shadow-[0_4px_20px_rgba(140,26,26,0.3)] hover:bg-[#a52020] hover:shadow-[0_6px_28px_rgba(140,26,26,0.4)] active:scale-[0.99] disabled:opacity-50 disabled:shadow-none transition-all"
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t.submitting}
          </span>
        ) : t.submit}
      </button>
    </form>
  );
}
