'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

type FormLocale = 'fr' | 'en' | 'de';

type Copy = {
  hero: {
    badge: string;
    eyebrow: string;
    title: string;
    highlight: string;
    subtitle: string;
    cta: string;
  };
  info: {
    eyebrow: string;
    title: string;
    body: (deadline: string) => string;
    deadline: string;
  };
  form: {
    sectionPersonal: string;
    sectionBooth: string;
    sectionExtras: string;
    fullName: string;
    fullNamePh: string;
    email: string;
    emailPh: string;
    phone: string;
    phonePh: string;
    brandName: string;
    brandNamePh: string;
    boothPurpose: string;
    boothPurposeChoose: string;
    purposeOptions: { value: string; label: string }[];
    brandDescription: string;
    brandDescriptionPh: string;
    visitorTakeaway: string;
    visitorTakeawayPh: string;
    exhibitionMaterials: string;
    exhibitionMaterialsPh: string;
    equipmentNeeds: string;
    equipmentOptions: { value: string; label: string }[];
    peopleCount: string;
    peopleCountOptions: string[];
    peopleNames: string;
    peopleNamesPh: string;
    websiteOrSocial: string;
    websiteOrSocialPh: string;
    additionalComment: string;
    additionalCommentPh: string;
    required: string;
    optional: string;
    submit: string;
    submitting: string;
    errorMissing: string;
    errorEmail: string;
    errorShort: string;
    errorServer: string;
    confirmTitle: string;
    confirmBody: string;
    confirmCta: string;
  };
  langLabel: string;
  back: string;
};

const COPY: Record<FormLocale, Copy> = {
  fr: {
    langLabel: 'Langue',
    back: 'Retour à l’accueil',
    hero: {
      badge: 'Stands exposants',
      eyebrow: 'Édition Level Up in Germany',
      title: 'Réservez votre stand à',
      highlight: 'Level Up in Germany',
      subtitle:
        'Présentez votre marque, votre service ou votre produit à une audience qui vient chercher des idées, des solutions et des opportunités concrètes.',
      cta: 'Réserver mon stand',
    },
    info: {
      eyebrow: 'Stands 2026',
      title: 'Une rencontre entre votre projet et un public engagé',
      deadline: '[date limite à définir]',
      body: (d) =>
        `Cette année, les stands de Level Up in Germany sont pensés comme des espaces de rencontre entre les visiteurs et des projets capables de leur apporter quelque chose de concret : une solution, une idée, une démonstration, un conseil ou une nouvelle opportunité. Les réservations sont ouvertes jusqu’au ${d}. Après l’envoi du formulaire, notre équipe étudiera votre demande afin de s’assurer que votre proposition correspond à l’esprit de l’événement.`,
    },
    form: {
      sectionPersonal: 'Vos informations',
      sectionBooth: 'Votre stand',
      sectionExtras: 'Logistique & contact',
      fullName: 'Nom complet',
      fullNamePh: 'Prénom et nom',
      email: 'Adresse e-mail',
      emailPh: 'vous@exemple.com',
      phone: 'Numéro de téléphone',
      phonePh: '+49 …',
      brandName: 'Nom de l’entreprise, marque ou projet',
      brandNamePh: 'Ex : Atelier Njoka',
      boothPurpose: 'Quel est le but principal de votre stand ?',
      boothPurposeChoose: '— Choisir —',
      purposeOptions: [
        { value: 'showcase_brand', label: 'Présenter une marque' },
        { value: 'sell_product', label: 'Vendre un produit' },
        { value: 'present_service', label: 'Présenter un service' },
        { value: 'run_demo', label: 'Faire une démonstration' },
        { value: 'build_connections', label: 'Créer des contacts professionnels' },
        { value: 'recruit_partners', label: 'Recruter ou trouver des partenaires' },
        { value: 'other', label: 'Autre' },
      ],
      brandDescription: 'Décrivez votre marque, produit ou service',
      brandDescriptionPh:
        'Expliquez ce que vous proposez, à qui cela s’adresse et pourquoi cela peut être pertinent pour les visiteurs.',
      visitorTakeaway:
        'Que pourra retenir ou découvrir une personne après être passée sur votre stand ?',
      visitorTakeawayPh:
        'Exemple : une démonstration, un conseil concret, une solution utile, une offre spéciale, une inspiration, un diagnostic rapide ou une découverte produit.',
      exhibitionMaterials: 'Quels produits ou supports souhaitez-vous exposer ?',
      exhibitionMaterialsPh: 'Catalogue, échantillons, écran vidéo, brochures…',
      equipmentNeeds: 'Avez-vous besoin d’un équipement particulier ?',
      equipmentOptions: [
        { value: 'table', label: 'Table' },
        { value: 'chair', label: 'Chaise' },
        { value: 'power', label: 'Prise électrique' },
        { value: 'rollup', label: 'Espace pour roll-up' },
        { value: 'internet', label: 'Connexion internet' },
        { value: 'other', label: 'Autre' },
      ],
      peopleCount: 'Combien de personnes seront présentes sur le stand ?',
      peopleCountOptions: ['1', '2', '3', 'Plus de 3'],
      peopleNames: 'Nom des personnes présentes sur le stand',
      peopleNamesPh: 'Une personne par ligne',
      websiteOrSocial: 'Lien vers votre site web ou réseau social',
      websiteOrSocialPh: 'https://…',
      additionalComment: 'Souhaitez-vous ajouter une remarque ?',
      additionalCommentPh: 'Un détail à nous transmettre, une question…',
      required: 'Obligatoire',
      optional: 'Optionnel',
      submit: 'Envoyer ma demande',
      submitting: 'Envoi en cours…',
      errorMissing: 'Merci de remplir tous les champs obligatoires.',
      errorEmail: 'Adresse e-mail invalide.',
      errorShort:
        'Les descriptions doivent contenir au moins 30 caractères pour que nous puissions étudier votre proposition.',
      errorServer: 'Une erreur est survenue. Réessayez dans quelques instants.',
      confirmTitle: 'Demande bien reçue',
      confirmBody:
        'Merci pour votre demande de réservation. Notre équipe va examiner les informations transmises et vous contactera prochainement pour confirmer la disponibilité du stand et les prochaines étapes.',
      confirmCta: 'Retour à l’accueil',
    },
  },
  en: {
    langLabel: 'Language',
    back: 'Back to home',
    hero: {
      badge: 'Exhibitor booths',
      eyebrow: 'Level Up in Germany edition',
      title: 'Book your booth at',
      highlight: 'Level Up in Germany',
      subtitle:
        'Present your brand, service, or product to an audience looking for ideas, solutions, and concrete opportunities.',
      cta: 'Book my booth',
    },
    info: {
      eyebrow: '2026 booths',
      title: 'A meeting point between your project and an engaged audience',
      deadline: '[deadline to be defined]',
      body: (d) =>
        `This year, the booths at Level Up in Germany are designed as meeting points between visitors and projects that can bring them something concrete: a solution, an idea, a demo, advice, or a new opportunity. Reservations are open until ${d}. After submitting the form, our team will review your request to make sure your proposal fits the spirit of the event.`,
    },
    form: {
      sectionPersonal: 'Your information',
      sectionBooth: 'Your booth',
      sectionExtras: 'Logistics & contact',
      fullName: 'Full name',
      fullNamePh: 'First and last name',
      email: 'Email address',
      emailPh: 'you@example.com',
      phone: 'Phone number',
      phonePh: '+49 …',
      brandName: 'Company, brand or project name',
      brandNamePh: 'e.g. Atelier Njoka',
      boothPurpose: 'What is the main purpose of your booth?',
      boothPurposeChoose: '— Choose —',
      purposeOptions: [
        { value: 'showcase_brand', label: 'Showcase a brand' },
        { value: 'sell_product', label: 'Sell a product' },
        { value: 'present_service', label: 'Present a service' },
        { value: 'run_demo', label: 'Run a demo' },
        { value: 'build_connections', label: 'Build professional connections' },
        { value: 'recruit_partners', label: 'Recruit or find partners' },
        { value: 'other', label: 'Other' },
      ],
      brandDescription: 'Describe your brand, product or service',
      brandDescriptionPh:
        'Explain what you offer, who it is for, and why it may be relevant to visitors.',
      visitorTakeaway: 'What should someone take away or discover after visiting your booth?',
      visitorTakeawayPh:
        'Example: a demo, practical advice, a useful solution, a special offer, inspiration, a quick diagnosis, or a product discovery.',
      exhibitionMaterials: 'What products or materials would you like to exhibit?',
      exhibitionMaterialsPh: 'Catalogue, samples, video screen, brochures…',
      equipmentNeeds: 'Do you need any specific equipment?',
      equipmentOptions: [
        { value: 'table', label: 'Table' },
        { value: 'chair', label: 'Chair' },
        { value: 'power', label: 'Power socket' },
        { value: 'rollup', label: 'Space for roll-up banner' },
        { value: 'internet', label: 'Internet connection' },
        { value: 'other', label: 'Other' },
      ],
      peopleCount: 'How many people will be present at the booth?',
      peopleCountOptions: ['1', '2', '3', 'More than 3'],
      peopleNames: 'Names of the people present at the booth',
      peopleNamesPh: 'One name per line',
      websiteOrSocial: 'Website or social media link',
      websiteOrSocialPh: 'https://…',
      additionalComment: 'Would you like to add a comment?',
      additionalCommentPh: 'Any detail you want to share, a question…',
      required: 'Required',
      optional: 'Optional',
      submit: 'Send my request',
      submitting: 'Sending…',
      errorMissing: 'Please fill in all required fields.',
      errorEmail: 'Invalid email address.',
      errorShort:
        'Descriptions must be at least 30 characters so we can properly review your proposal.',
      errorServer: 'Something went wrong. Please try again shortly.',
      confirmTitle: 'Request received',
      confirmBody:
        'Thank you for your booth reservation request. Our team will review your information and contact you soon to confirm booth availability and the next steps.',
      confirmCta: 'Back to home',
    },
  },
  de: {
    langLabel: 'Sprache',
    back: 'Zurück zur Startseite',
    hero: {
      badge: 'Aussteller-Stände',
      eyebrow: 'Level Up in Germany Edition',
      title: 'Reservieren Sie Ihren Stand bei',
      highlight: 'Level Up in Germany',
      subtitle:
        'Präsentieren Sie Ihre Marke, Ihre Dienstleistung oder Ihr Produkt vor einem Publikum, das nach Ideen, Lösungen und konkreten Möglichkeiten sucht.',
      cta: 'Stand reservieren',
    },
    info: {
      eyebrow: 'Stände 2026',
      title: 'Ein Treffpunkt zwischen Ihrem Projekt und einem engagierten Publikum',
      deadline: '[Frist einfügen]',
      body: (d) =>
        `Die Stände bei Level Up in Germany sind in diesem Jahr als Begegnungsflächen gedacht — zwischen Besucherinnen und Besuchern und Projekten, die ihnen etwas Konkretes mitgeben können: eine Lösung, eine Idee, eine Demo, einen Rat oder eine neue Möglichkeit. Reservierungen sind bis zum ${d} möglich. Nach dem Absenden des Formulars prüft unser Team Ihre Anfrage, um sicherzustellen, dass das Angebot zum Charakter der Veranstaltung passt.`,
    },
    form: {
      sectionPersonal: 'Ihre Angaben',
      sectionBooth: 'Ihr Stand',
      sectionExtras: 'Logistik & Kontakt',
      fullName: 'Vollständiger Name',
      fullNamePh: 'Vor- und Nachname',
      email: 'E-Mail-Adresse',
      emailPh: 'sie@beispiel.com',
      phone: 'Telefonnummer',
      phonePh: '+49 …',
      brandName: 'Name des Unternehmens, der Marke oder des Projekts',
      brandNamePh: 'z. B. Atelier Njoka',
      boothPurpose: 'Was ist das Hauptziel Ihres Standes?',
      boothPurposeChoose: '— Auswählen —',
      purposeOptions: [
        { value: 'showcase_brand', label: 'Eine Marke präsentieren' },
        { value: 'sell_product', label: 'Ein Produkt verkaufen' },
        { value: 'present_service', label: 'Eine Dienstleistung vorstellen' },
        { value: 'run_demo', label: 'Eine Demo durchführen' },
        { value: 'build_connections', label: 'Berufliche Kontakte knüpfen' },
        { value: 'recruit_partners', label: 'Rekrutieren oder Partner finden' },
        { value: 'other', label: 'Sonstiges' },
      ],
      brandDescription: 'Beschreiben Sie Ihre Marke, Ihr Produkt oder Ihre Dienstleistung',
      brandDescriptionPh:
        'Erklären Sie, was Sie anbieten, an wen es sich richtet und warum es für die Besucher relevant sein kann.',
      visitorTakeaway:
        'Was sollen Besucherinnen und Besucher nach einem Besuch an Ihrem Stand mitnehmen oder entdecken?',
      visitorTakeawayPh:
        'Beispiel: eine Demo, ein konkreter Tipp, eine nützliche Lösung, ein Sonderangebot, Inspiration, eine kurze Einschätzung oder eine Produktentdeckung.',
      exhibitionMaterials: 'Welche Produkte oder Materialien möchten Sie ausstellen?',
      exhibitionMaterialsPh: 'Katalog, Muster, Bildschirm, Broschüren…',
      equipmentNeeds: 'Benötigen Sie spezielles Equipment?',
      equipmentOptions: [
        { value: 'table', label: 'Tisch' },
        { value: 'chair', label: 'Stuhl' },
        { value: 'power', label: 'Steckdose' },
        { value: 'rollup', label: 'Platz für Roll-up' },
        { value: 'internet', label: 'Internetverbindung' },
        { value: 'other', label: 'Sonstiges' },
      ],
      peopleCount: 'Wie viele Personen werden am Stand anwesend sein?',
      peopleCountOptions: ['1', '2', '3', 'Mehr als 3'],
      peopleNames: 'Namen der Personen am Stand',
      peopleNamesPh: 'Ein Name pro Zeile',
      websiteOrSocial: 'Website- oder Social-Media-Link',
      websiteOrSocialPh: 'https://…',
      additionalComment: 'Möchten Sie eine Anmerkung hinzufügen?',
      additionalCommentPh: 'Ein Hinweis, eine Frage…',
      required: 'Pflichtfeld',
      optional: 'Optional',
      submit: 'Anfrage absenden',
      submitting: 'Wird gesendet…',
      errorMissing: 'Bitte füllen Sie alle Pflichtfelder aus.',
      errorEmail: 'Ungültige E-Mail-Adresse.',
      errorShort:
        'Die Beschreibungen müssen mindestens 30 Zeichen lang sein, damit wir Ihren Vorschlag prüfen können.',
      errorServer: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es in Kürze erneut.',
      confirmTitle: 'Anfrage erhalten',
      confirmBody:
        'Vielen Dank für Ihre Reservierungsanfrage. Unser Team prüft Ihre Angaben und wird Sie zeitnah kontaktieren, um die Verfügbarkeit des Standes und die nächsten Schritte zu bestätigen.',
      confirmCta: 'Zurück zur Startseite',
    },
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BoothReservationClient({ initialLocale }: { initialLocale: FormLocale }) {
  const [lang, setLang] = useState<FormLocale>(initialLocale);
  const t = useMemo(() => COPY[lang], [lang]);

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [brandName, setBrandName] = useState('');
  const [boothPurpose, setBoothPurpose] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [visitorTakeaway, setVisitorTakeaway] = useState('');
  const [exhibitionMaterials, setExhibitionMaterials] = useState('');
  const [equipmentNeeds, setEquipmentNeeds] = useState<string[]>([]);
  const [peopleCount, setPeopleCount] = useState('');
  const [peopleNames, setPeopleNames] = useState('');
  const [websiteOrSocial, setWebsiteOrSocial] = useState('');
  const [additionalComment, setAdditionalComment] = useState('');

  function toggleEquipment(v: string) {
    setEquipmentNeeds((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !brandName.trim() ||
      !boothPurpose ||
      !brandDescription.trim() ||
      !visitorTakeaway.trim() ||
      !peopleCount
    ) {
      setError(t.form.errorMissing);
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError(t.form.errorEmail);
      return;
    }
    if (brandDescription.trim().length < 30 || visitorTakeaway.trim().length < 30) {
      setError(t.form.errorShort);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/booth-reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          brandName,
          boothPurpose,
          brandDescription,
          visitorTakeaway,
          exhibitionMaterials,
          equipmentNeeds,
          peopleCount,
          peopleNames,
          websiteOrSocial,
          additionalComment,
          locale: lang,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.error === 'invalid_email') setError(t.form.errorEmail);
        else if (data?.error === 'too_short') setError(t.form.errorShort);
        else if (data?.error === 'missing_required') setError(t.form.errorMissing);
        else setError(t.form.errorServer);
        return;
      }
      setConfirmed(true);
    } catch {
      setError(t.form.errorServer);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[100svh] w-full overflow-hidden bg-[#120505] text-white">
      <style>{`
        @keyframes bk-orb-a { 0%,100%{transform:translate3d(-10%,-10%,0) scale(1);} 50%{transform:translate3d(15%,5%,0) scale(1.15);} }
        @keyframes bk-orb-b { 0%,100%{transform:translate3d(20%,0%,0) scale(1.1);} 50%{transform:translate3d(-15%,20%,0) scale(0.95);} }
        @keyframes bk-orb-c { 0%,100%{transform:translate3d(-5%,25%,0) scale(0.9);} 50%{transform:translate3d(10%,-10%,0) scale(1.2);} }
        @keyframes bk-conic { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes bk-rise { 0%{opacity:0;transform:translateY(24px);} 100%{opacity:1;transform:translateY(0);} }
        @keyframes bk-twinkle { 0%,100%{opacity:.15;transform:scale(1);} 50%{opacity:.9;transform:scale(1.4);} }
        @keyframes bk-shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        .bk-rise{animation:bk-rise .7s cubic-bezier(0.22,1,0.36,1) both;}
        .bk-shimmer{background:linear-gradient(90deg,#ffffff 0%,#ffd58a 25%,#E98C0B 50%,#ffd58a 75%,#ffffff 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:bk-shimmer 6s linear infinite;}
        @media (prefers-reduced-motion: reduce) { .bk-no-motion{animation:none!important;} }
      `}</style>

      {/* Background — matches /buy-ticket */}
      <div aria-hidden className="bk-no-motion pointer-events-none absolute -top-40 -left-40 h-[60vmax] w-[60vmax] rounded-full bg-[#8C1A1A] opacity-60 blur-[120px]" style={{ animation: 'bk-orb-a 18s ease-in-out infinite' }} />
      <div aria-hidden className="bk-no-motion pointer-events-none absolute -bottom-40 -right-40 h-[55vmax] w-[55vmax] rounded-full bg-[#E98C0B] opacity-40 blur-[140px]" style={{ animation: 'bk-orb-b 22s ease-in-out infinite' }} />
      <div aria-hidden className="bk-no-motion pointer-events-none absolute top-1/2 left-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c77409] opacity-25 blur-[110px]" style={{ animation: 'bk-orb-c 26s ease-in-out infinite' }} />
      <div aria-hidden className="bk-no-motion pointer-events-none absolute top-1/2 left-1/2 h-[120vmin] w-[120vmin] rounded-full opacity-25" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(233,140,11,0.35) 40deg, transparent 80deg, transparent 200deg, rgba(140,26,26,0.5) 250deg, transparent 290deg)', animation: 'bk-conic 40s linear infinite', filter: 'blur(40px)', transform: 'translate(-50%, -50%)' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[
          { top: '12%', left: '18%', delay: '0s' },
          { top: '22%', left: '78%', delay: '1.4s' },
          { top: '35%', left: '42%', delay: '2.8s' },
          { top: '58%', left: '12%', delay: '0.6s' },
          { top: '67%', left: '88%', delay: '3.2s' },
          { top: '78%', left: '36%', delay: '1.9s' },
          { top: '84%', left: '64%', delay: '0.3s' },
          { top: '15%', left: '52%', delay: '2.2s' },
        ].map((s, i) => (
          <span key={i} className="bk-no-motion absolute h-1 w-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" style={{ top: s.top, left: s.left, animation: `bk-twinkle 4.5s ease-in-out ${s.delay} infinite` }} />
        ))}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.55) 100%)' }} />

      <main className="relative z-10 mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        {/* Top bar: lang + back */}
        <div className="bk-rise mb-10 flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/${lang}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70 backdrop-blur-sm transition hover:border-white/30 hover:bg-white/10"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
            {t.back}
          </Link>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-sm">
            <span className="px-2 text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/40">{t.langLabel}</span>
            {(['fr', 'en', 'de'] as FormLocale[]).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase transition ${
                  lang === code
                    ? 'bg-accent text-[#1a0606] shadow-[0_4px_14px_rgba(233,140,11,0.4)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* HERO */}
        <section className="bk-rise text-center" style={{ animationDelay: '0.1s' }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-accent backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t.hero.badge}
          </span>
          <p className="mt-5 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-white/55">{t.hero.eyebrow}</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="block text-white">{t.hero.title}</span>
            <span className="bk-shimmer bk-no-motion block italic">{t.hero.highlight}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-white/70 sm:text-lg">{t.hero.subtitle}</p>
          <a
            href="#booth-form"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-[#1a0606] shadow-[0_8px_30px_rgba(233,140,11,0.45)] transition hover:bg-accent-light hover:shadow-[0_10px_40px_rgba(233,140,11,0.6)]"
          >
            {t.hero.cta}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
          </a>
        </section>

        {/* INFO */}
        <section className="bk-rise mx-auto mt-16 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8" style={{ animationDelay: '0.2s' }}>
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-accent/70">{t.info.eyebrow}</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{t.info.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">{t.info.body(t.info.deadline)}</p>
        </section>

        {/* FORM or CONFIRM */}
        <section id="booth-form" className="bk-rise mt-16 scroll-mt-24" style={{ animationDelay: '0.3s' }}>
          {confirmed ? (
            <ConfirmationCard t={t} />
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-10 rounded-3xl border border-white/10 bg-[#1a0808]/70 p-6 backdrop-blur-md sm:p-10"
            >
              {/* Section: personal */}
              <FieldSection title={t.form.sectionPersonal}>
                <Field label={t.form.fullName} required reqLabel={t.form.required}>
                  <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t.form.fullNamePh} required maxLength={200} />
                </Field>
                <Field label={t.form.email} required reqLabel={t.form.required}>
                  <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.form.emailPh} required maxLength={200} />
                </Field>
                <Field label={t.form.phone} required reqLabel={t.form.required}>
                  <input type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t.form.phonePh} required maxLength={60} />
                </Field>
                <Field label={t.form.brandName} required reqLabel={t.form.required}>
                  <input className={inputCls} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder={t.form.brandNamePh} required maxLength={200} />
                </Field>
              </FieldSection>

              {/* Section: booth */}
              <FieldSection title={t.form.sectionBooth}>
                <Field label={t.form.boothPurpose} required reqLabel={t.form.required} full>
                  <select className={inputCls} value={boothPurpose} onChange={(e) => setBoothPurpose(e.target.value)} required>
                    <option value="">{t.form.boothPurposeChoose}</option>
                    {t.form.purposeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t.form.brandDescription} required reqLabel={t.form.required} full>
                  <textarea rows={4} className={textareaCls} value={brandDescription} onChange={(e) => setBrandDescription(e.target.value)} placeholder={t.form.brandDescriptionPh} required maxLength={5000} />
                </Field>
                <Field label={t.form.visitorTakeaway} required reqLabel={t.form.required} full>
                  <textarea rows={4} className={textareaCls} value={visitorTakeaway} onChange={(e) => setVisitorTakeaway(e.target.value)} placeholder={t.form.visitorTakeawayPh} required maxLength={5000} />
                </Field>
                <Field label={t.form.exhibitionMaterials} reqLabel={t.form.optional} full>
                  <textarea rows={3} className={textareaCls} value={exhibitionMaterials} onChange={(e) => setExhibitionMaterials(e.target.value)} placeholder={t.form.exhibitionMaterialsPh} maxLength={5000} />
                </Field>
              </FieldSection>

              {/* Section: logistics */}
              <FieldSection title={t.form.sectionExtras}>
                <Field label={t.form.equipmentNeeds} reqLabel={t.form.optional} full>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {t.form.equipmentOptions.map((o) => {
                      const active = equipmentNeeds.includes(o.value);
                      return (
                        <button
                          key={o.value}
                          type="button"
                          onClick={() => toggleEquipment(o.value)}
                          className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            active
                              ? 'border-accent/60 bg-accent/15 text-accent'
                              : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30 hover:bg-white/[0.08]'
                          }`}
                        >
                          <span className={`h-3.5 w-3.5 rounded-[4px] border ${active ? 'border-accent bg-accent' : 'border-white/40'}`} />
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </Field>

                <Field label={t.form.peopleCount} required reqLabel={t.form.required}>
                  <div className="flex flex-wrap gap-2">
                    {t.form.peopleCountOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPeopleCount(opt)}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                          peopleCount === opt
                            ? 'border-accent/60 bg-accent/15 text-accent'
                            : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30 hover:bg-white/[0.08]'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </Field>

                <Field label={t.form.peopleNames} reqLabel={t.form.optional} full>
                  <textarea rows={3} className={textareaCls} value={peopleNames} onChange={(e) => setPeopleNames(e.target.value)} placeholder={t.form.peopleNamesPh} maxLength={1000} />
                </Field>

                <Field label={t.form.websiteOrSocial} reqLabel={t.form.optional}>
                  <input className={inputCls} value={websiteOrSocial} onChange={(e) => setWebsiteOrSocial(e.target.value)} placeholder={t.form.websiteOrSocialPh} maxLength={500} />
                </Field>

                <Field label={t.form.additionalComment} reqLabel={t.form.optional} full>
                  <textarea rows={3} className={textareaCls} value={additionalComment} onChange={(e) => setAdditionalComment(e.target.value)} placeholder={t.form.additionalCommentPh} maxLength={5000} />
                </Field>
              </FieldSection>

              {error && (
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center justify-end gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-[#1a0606] shadow-[0_8px_30px_rgba(233,140,11,0.45)] transition hover:bg-accent-light hover:shadow-[0_10px_40px_rgba(233,140,11,0.6)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a0606]/30 border-t-[#1a0606]" />
                      {t.form.submitting}
                    </>
                  ) : (
                    <>
                      {t.form.submit}
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-white/15 bg-[#0f0606]/80 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20';
const textareaCls = inputCls + ' resize-y leading-relaxed';

function FieldSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.28em] text-accent">
        <span className="h-1 w-6 rounded-full bg-accent" />
        {title}
      </h3>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  reqLabel,
  full,
  children,
}: {
  label: string;
  required?: boolean;
  reqLabel: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-1.5 ${full ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-semibold text-white/75">{label}</label>
        <span className={`text-[0.6rem] font-bold uppercase tracking-wider ${required ? 'text-accent/80' : 'text-white/30'}`}>
          {reqLabel}
        </span>
      </div>
      {children}
    </div>
  );
}

function ConfirmationCard({ t }: { t: Copy }) {
  return (
    <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/[0.08] p-8 text-center sm:p-12">
      <div className="mx-auto mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-emerald-300" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="font-display text-2xl font-bold text-white sm:text-3xl">{t.form.confirmTitle}</h3>
      <p className="mx-auto mt-4 max-w-xl text-sm text-white/75 sm:text-base">{t.form.confirmBody}</p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/85 backdrop-blur-sm transition hover:border-white/40 hover:bg-white/10"
      >
        {t.form.confirmCta}
      </Link>
    </div>
  );
}
