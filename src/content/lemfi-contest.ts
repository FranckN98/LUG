import type { Locale } from '@/i18n/config';

/** Textes du jeu concours Level Up in Germany x LemFi (pages, API et e-mails). */

export type LemfiErrorKey =
  | 'rate_limited'
  | 'file_too_large'
  | 'invalid_request'
  | 'captcha'
  | 'captcha_required'
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'consent'
  | 'proof_required'
  | 'file_type'
  | 'image_unreadable'
  | 'full'
  | 'email_taken'
  | 'server_error'
  | 'network'
  | 'resend_wait'
  | 'invalid_link';

export type LemfiCopy = {
  seo: { title: string; description: string };
  homeAria: string;
  kicker: string;
  notice: string;
  intro: string;
  eventLine: string;
  prizes: { tablet: string; headphones: string; umbrella: string; tshirt: string; surprises: string };
  stepsLabel: string;
  step1: { title: string; detail: string; button: string; soon: string };
  step2: { title: string; codeLabel: string; copy: string; copied: string; cashback: string };
  step3: { title: string };
  existing: string;
  cta: string;
  form: {
    firstName: string;
    lastName: string;
    email: string;
    proofLabel: string;
    pick: string;
    hint: string;
    preparing: string;
    replace: string;
    optimized: string;
    previewAlt: string;
    proofInstructions: string;
    consent: string;
    privacy: string;
    submit: string;
    sending: string;
    uploading: (pct: number) => string;
    saving: string;
    fullTitle: string;
  };
  success: {
    received: string;
    numberIs: string;
    eligibility: string;
    emailSent: (email: string) => string;
    emailFailed: string;
    resend: string;
    resending: string;
    resendFailed: string;
    linkLabel: string;
    copy: string;
    copied: string;
    personalNote: string;
    track: string;
  };
  track: {
    hello: (name: string) => string;
    pending: { title: string; text: string };
    validated: { title: string; text: string };
    rejected: { title: string; text: string };
    reason: string;
    receivedOn: string;
    decidedOn: string;
    emailSentOn: string;
    personalNote: string;
  };
  email: {
    subject: (number: string) => string;
    greeting: (name: string) => string;
    received: string;
    numberLabel: string;
    statusLabel: string;
    statusValue: string;
    eligibility: string;
    button: string;
    personalNote: string;
    fallback: string;
  };
  errors: Record<LemfiErrorKey, string>;
};

const NB = '\u00a0';

const fr: LemfiCopy = {
  seo: {
    title: 'Jeu concours Level Up in Germany × LemFi',
    description:
      'Faites plaisir à votre personne préférée et tentez de gagner une tablette, des AirPods, des parapluies, des t-shirts et d’autres surprises le jour de Level Up in Germany.',
  },
  homeAria: 'Level Up in Germany — accueil',
  kicker: 'Jeu concours',
  notice: 'Concours réservé aux personnes qui participeront à Level Up in Germany.',
  intro:
    'Level Up, c’est aussi reconnaître les efforts de nos parents et de celles et ceux qui ont toujours été là pour nous. Faites plaisir à votre personne préférée et tentez de gagner une tablette, des AirPods, des parapluies, des t-shirts et d’autres surprises le jour de Level Up in Germany !',
  eventLine: 'Tirage au sort · Sam. 17 octobre · The Squaire, Francfort',
  prizes: { tablet: 'Tablette', headphones: 'AirPods', umbrella: 'Parapluies', tshirt: 'T-shirts', surprises: 'Surprises' },
  stepsLabel: 'Participer en 3 étapes',
  step1: {
    title: 'Téléchargez LemFi',
    detail: 'en cliquant sur le bouton ci-dessous.',
    button: 'Télécharger LemFi',
    soon: 'Le lien sera disponible très prochainement.',
  },
  step2: {
    title: 'Effectuez un transfert d’au moins 25 € avec le code LEVELUP.',
    codeLabel: 'Code',
    copy: 'Copier',
    copied: 'Copié',
    cashback: `Recevez 25${NB}% de cashback`,
  },
  step3: { title: 'Inscrivez-vous et envoyez votre capture d’écran.' },
  existing: `Vous utilisez déjà LemFi${NB}? Passez directement aux étapes 2 et 3.`,
  cta: 'À vous de jouer !',
  form: {
    firstName: 'Prénom',
    lastName: 'Nom',
    email: 'Adresse e-mail',
    proofLabel: 'Capture de confirmation du transfert',
    pick: 'Choisir ma capture d’écran',
    hint: 'JPG, PNG ou WebP · 5 Mo maximum',
    preparing: 'Préparation de l’image…',
    replace: 'Remplacer le fichier',
    optimized: 'image optimisée automatiquement',
    previewAlt: 'Aperçu de votre capture',
    proofInstructions:
      'Laissez visibles le montant, la date et la confirmation du transfert. Masquez votre solde et les informations sensibles.',
    consent:
      'Je confirme que je serai présent(e) à Level Up in Germany, que je respecte les conditions du concours et que mes données seront utilisées pour gérer le concours.',
    privacy: 'Notice de confidentialité',
    submit: 'Envoyer ma participation',
    sending: 'Envoi en cours…',
    uploading: (pct) => `Envoi de votre capture… ${pct}${NB}%`,
    saving: 'Enregistrement de votre participation…',
    fullTitle: 'Inscriptions complètes',
  },
  success: {
    received: 'Participation reçue.',
    numberIs: 'Votre numéro est',
    eligibility: 'Votre éligibilité au tirage sera confirmée après vérification de votre preuve.',
    emailSent: (email) => `Un e-mail de confirmation a été envoyé à ${email}.`,
    emailFailed:
      'Votre participation est bien enregistrée, mais l’e-mail de confirmation n’a pas pu être envoyé pour le moment. Notez votre numéro et conservez votre lien personnel ci-dessous.',
    resend: 'Renvoyer l’e-mail',
    resending: 'Envoi…',
    resendFailed: 'L’e-mail n’a toujours pas pu être envoyé. Conservez votre numéro et votre lien.',
    linkLabel: 'Votre lien personnel de suivi',
    copy: 'Copier',
    copied: 'Copié',
    personalNote: 'Ce lien est personnel : ne le partagez pas.',
    track: 'Suivre ma participation',
  },
  track: {
    hello: (name) => `Bonjour ${name}, votre numéro est`,
    pending: {
      title: 'En attente de vérification',
      text: 'Votre éligibilité au tirage sera confirmée après vérification de votre preuve.',
    },
    validated: { title: 'Participation validée', text: 'Vous êtes éligible au tirage. Votre numéro reste inchangé.' },
    rejected: { title: 'Participation non retenue', text: 'Votre preuve n’a pas pu être validée.' },
    reason: 'Motif :',
    receivedOn: 'Participation reçue le',
    decidedOn: 'Dernière décision le',
    emailSentOn: 'E-mail de confirmation envoyé le',
    personalNote: 'Ce lien est personnel : ne le partagez pas.',
  },
  email: {
    subject: (n) => `Participation reçue – ${n} – Level Up in Germany × LemFi`,
    greeting: (name) => `Bonjour ${name},`,
    received: 'Participation reçue au jeu concours Level Up in Germany × LemFi.',
    numberLabel: 'Votre numéro',
    statusLabel: 'Statut',
    statusValue: 'en attente de vérification',
    eligibility: 'Votre éligibilité au tirage sera confirmée après vérification de votre preuve.',
    button: 'Suivre ma participation',
    personalNote: 'Ce lien est personnel : ne le partagez pas.',
    fallback: 'Si le bouton ne fonctionne pas, copiez cette adresse :',
  },
  errors: {
    rate_limited: 'Trop de tentatives. Patientez quelques minutes avant de réessayer.',
    file_too_large: 'Fichier trop lourd. La taille maximale est de 5 Mo.',
    invalid_request: 'Le formulaire n’a pas pu être lu. Rechargez la page et réessayez.',
    captcha: 'La vérification anti-robot a échoué. Réessayez.',
    captcha_required: 'Validez la vérification anti-robot avant d’envoyer.',
    first_name: 'Indiquez un prénom valide.',
    last_name: 'Indiquez un nom valide.',
    email: 'Indiquez une adresse e-mail valide.',
    consent: 'Cochez la case de confirmation pour participer.',
    proof_required: 'Ajoutez la capture de confirmation du transfert.',
    file_type: 'Format non accepté. Utilisez une image JPG, PNG ou WebP.',
    image_unreadable: 'Cette image n’a pas pu être lue. Essayez une autre capture.',
    full: 'Inscriptions complètes',
    email_taken: 'Cette adresse e-mail est déjà inscrite. Une seule participation est possible par adresse.',
    server_error: 'L’enregistrement a échoué. Vos informations sont conservées : réessayez dans un instant.',
    network: 'Connexion interrompue. Vos informations sont conservées : réessayez, vous ne serez pas inscrit(e) deux fois.',
    resend_wait: 'Patientez quelques secondes avant de redemander l’e-mail.',
    invalid_link: 'Lien invalide.',
  },
};

const en: LemfiCopy = {
  seo: {
    title: 'Level Up in Germany × LemFi Giveaway',
    description:
      'Treat your favourite person and try to win a tablet, AirPods, umbrellas, T-shirts and other surprises on the day of Level Up in Germany.',
  },
  homeAria: 'Level Up in Germany — home',
  kicker: 'Giveaway',
  notice: 'Open only to people attending Level Up in Germany.',
  intro:
    'Level Up is also about recognising the efforts of our parents and of those who have always been there for us. Treat your favourite person and try to win a tablet, AirPods, umbrellas, T-shirts and other surprises on the day of Level Up in Germany!',
  eventLine: 'Prize draw · Sat. 17 October · The Squaire, Frankfurt',
  prizes: { tablet: 'Tablet', headphones: 'AirPods', umbrella: 'Umbrellas', tshirt: 'T-shirts', surprises: 'Surprises' },
  stepsLabel: 'Take part in 3 steps',
  step1: {
    title: 'Download LemFi',
    detail: 'by clicking the button below.',
    button: 'Download LemFi',
    soon: 'The link will be available very soon.',
  },
  step2: {
    title: 'Make a transfer of at least €25 with the code LEVELUP.',
    codeLabel: 'Code',
    copy: 'Copy',
    copied: 'Copied',
    cashback: 'Get 25% cashback',
  },
  step3: { title: 'Sign up and send your screenshot.' },
  existing: 'Already using LemFi? Go straight to steps 2 and 3.',
  cta: 'Your turn to play!',
  form: {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email address',
    proofLabel: 'Transfer confirmation screenshot',
    pick: 'Choose my screenshot',
    hint: 'JPG, PNG or WebP · 5 MB maximum',
    preparing: 'Preparing image…',
    replace: 'Replace file',
    optimized: 'image automatically optimised',
    previewAlt: 'Preview of your screenshot',
    proofInstructions:
      'Keep the amount, the date and the transfer confirmation visible. Hide your balance and any sensitive information.',
    consent:
      'I confirm that I will attend Level Up in Germany, that I comply with the contest conditions, and that my data will be used to run the contest.',
    privacy: 'Privacy notice',
    submit: 'Submit my entry',
    sending: 'Sending…',
    uploading: (pct) => `Uploading your screenshot… ${pct}%`,
    saving: 'Saving your entry…',
    fullTitle: 'Registrations full',
  },
  success: {
    received: 'Entry received.',
    numberIs: 'Your number is',
    eligibility: 'Your eligibility for the draw will be confirmed after your proof has been verified.',
    emailSent: (email) => `A confirmation email has been sent to ${email}.`,
    emailFailed:
      'Your entry is saved, but the confirmation email could not be sent for now. Please note your number and keep your personal link below.',
    resend: 'Resend email',
    resending: 'Sending…',
    resendFailed: 'The email still could not be sent. Please keep your number and your link.',
    linkLabel: 'Your personal tracking link',
    copy: 'Copy',
    copied: 'Copied',
    personalNote: 'This link is personal: please don’t share it.',
    track: 'Track my entry',
  },
  track: {
    hello: (name) => `Hello ${name}, your number is`,
    pending: {
      title: 'Pending verification',
      text: 'Your eligibility for the draw will be confirmed after your proof has been verified.',
    },
    validated: { title: 'Entry validated', text: 'You are eligible for the draw. Your number stays the same.' },
    rejected: { title: 'Entry not accepted', text: 'Your proof could not be validated.' },
    reason: 'Reason:',
    receivedOn: 'Entry received on',
    decidedOn: 'Last decision on',
    emailSentOn: 'Confirmation email sent on',
    personalNote: 'This link is personal: please don’t share it.',
  },
  email: {
    subject: (n) => `Entry received – ${n} – Level Up in Germany × LemFi`,
    greeting: (name) => `Hello ${name},`,
    received: 'Your entry to the Level Up in Germany × LemFi giveaway has been received.',
    numberLabel: 'Your number',
    statusLabel: 'Status',
    statusValue: 'pending verification',
    eligibility: 'Your eligibility for the draw will be confirmed after your proof has been verified.',
    button: 'Track my entry',
    personalNote: 'This link is personal: please don’t share it.',
    fallback: 'If the button doesn’t work, copy this address:',
  },
  errors: {
    rate_limited: 'Too many attempts. Please wait a few minutes and try again.',
    file_too_large: 'File too large. The maximum size is 5 MB.',
    invalid_request: 'The form could not be read. Reload the page and try again.',
    captcha: 'The anti-bot check failed. Please try again.',
    captcha_required: 'Complete the anti-bot check before submitting.',
    first_name: 'Enter a valid first name.',
    last_name: 'Enter a valid last name.',
    email: 'Enter a valid email address.',
    consent: 'Tick the confirmation box to take part.',
    proof_required: 'Add the screenshot confirming your transfer.',
    file_type: 'Format not accepted. Use a JPG, PNG or WebP image.',
    image_unreadable: 'This image could not be read. Try another screenshot.',
    full: 'Registrations full',
    email_taken: 'This email address is already registered. Only one entry is allowed per address.',
    server_error: 'Registration failed. Your information is kept: please try again in a moment.',
    network: 'Connection lost. Your information is kept: try again, you won’t be registered twice.',
    resend_wait: 'Please wait a few seconds before requesting the email again.',
    invalid_link: 'Invalid link.',
  },
};

const de: LemfiCopy = {
  seo: {
    title: 'Level Up in Germany × LemFi Gewinnspiel',
    description:
      'Mach deiner Lieblingsperson eine Freude und gewinne ein Tablet, AirPods, Regenschirme, T-Shirts und weitere Überraschungen am Tag von Level Up in Germany.',
  },
  homeAria: 'Level Up in Germany — Startseite',
  kicker: 'Gewinnspiel',
  notice: 'Teilnahme nur für Personen, die am Level Up in Germany teilnehmen.',
  intro:
    'Level Up bedeutet auch, die Mühen unserer Eltern und all derer zu würdigen, die immer für uns da waren. Mach deiner Lieblingsperson eine Freude und gewinne ein Tablet, AirPods, Regenschirme, T-Shirts und weitere Überraschungen am Tag von Level Up in Germany!',
  eventLine: 'Verlosung · Sa., 17. Oktober · The Squaire, Frankfurt',
  prizes: {
    tablet: 'Tablet',
    headphones: 'AirPods',
    umbrella: 'Regenschirme',
    tshirt: 'T-Shirts',
    surprises: 'Überraschungen',
  },
  stepsLabel: 'In 3 Schritten teilnehmen',
  step1: {
    title: 'Lade LemFi herunter',
    detail: 'über den Button unten.',
    button: 'LemFi herunterladen',
    soon: 'Der Link ist in Kürze verfügbar.',
  },
  step2: {
    title: 'Überweise mindestens 25 € mit dem Code LEVELUP.',
    codeLabel: 'Code',
    copy: 'Kopieren',
    copied: 'Kopiert',
    cashback: 'Erhalte 25 % Cashback',
  },
  step3: { title: 'Melde dich an und sende deinen Screenshot.' },
  existing: 'Du nutzt LemFi bereits? Gehe direkt zu Schritt 2 und 3.',
  cta: 'Du bist dran!',
  form: {
    firstName: 'Vorname',
    lastName: 'Nachname',
    email: 'E-Mail-Adresse',
    proofLabel: 'Screenshot der Überweisungsbestätigung',
    pick: 'Screenshot auswählen',
    hint: 'JPG, PNG oder WebP · max. 5 MB',
    preparing: 'Bild wird vorbereitet…',
    replace: 'Datei ersetzen',
    optimized: 'Bild automatisch optimiert',
    previewAlt: 'Vorschau deines Screenshots',
    proofInstructions:
      'Lass den Betrag, das Datum und die Überweisungsbestätigung sichtbar. Verdecke deinen Kontostand und sensible Informationen.',
    consent:
      'Ich bestätige, dass ich am Level Up in Germany teilnehmen werde, die Teilnahmebedingungen einhalte und dass meine Daten zur Durchführung des Gewinnspiels verwendet werden.',
    privacy: 'Datenschutzhinweis',
    submit: 'Teilnahme absenden',
    sending: 'Wird gesendet…',
    uploading: (pct) => `Screenshot wird hochgeladen… ${pct} %`,
    saving: 'Teilnahme wird gespeichert…',
    fullTitle: 'Anmeldungen ausgebucht',
  },
  success: {
    received: 'Teilnahme erhalten.',
    numberIs: 'Deine Nummer ist',
    eligibility: 'Deine Teilnahmeberechtigung an der Verlosung wird nach Prüfung deines Nachweises bestätigt.',
    emailSent: (email) => `Eine Bestätigungs-E-Mail wurde an ${email} gesendet.`,
    emailFailed:
      'Deine Teilnahme ist gespeichert, aber die Bestätigungs-E-Mail konnte derzeit nicht gesendet werden. Notiere dir deine Nummer und bewahre deinen persönlichen Link unten auf.',
    resend: 'E-Mail erneut senden',
    resending: 'Wird gesendet…',
    resendFailed: 'Die E-Mail konnte weiterhin nicht gesendet werden. Bewahre deine Nummer und deinen Link auf.',
    linkLabel: 'Dein persönlicher Tracking-Link',
    copy: 'Kopieren',
    copied: 'Kopiert',
    personalNote: 'Dieser Link ist persönlich – bitte nicht weitergeben.',
    track: 'Meine Teilnahme verfolgen',
  },
  track: {
    hello: (name) => `Hallo ${name}, deine Nummer ist`,
    pending: {
      title: 'Prüfung ausstehend',
      text: 'Deine Teilnahmeberechtigung an der Verlosung wird nach Prüfung deines Nachweises bestätigt.',
    },
    validated: { title: 'Teilnahme bestätigt', text: 'Du nimmst an der Verlosung teil. Deine Nummer bleibt unverändert.' },
    rejected: { title: 'Teilnahme nicht anerkannt', text: 'Dein Nachweis konnte nicht bestätigt werden.' },
    reason: 'Grund:',
    receivedOn: 'Teilnahme eingegangen am',
    decidedOn: 'Letzte Entscheidung am',
    emailSentOn: 'Bestätigungs-E-Mail gesendet am',
    personalNote: 'Dieser Link ist persönlich – bitte nicht weitergeben.',
  },
  email: {
    subject: (n) => `Teilnahme erhalten – ${n} – Level Up in Germany × LemFi`,
    greeting: (name) => `Hallo ${name},`,
    received: 'Deine Teilnahme am Gewinnspiel Level Up in Germany × LemFi ist eingegangen.',
    numberLabel: 'Deine Nummer',
    statusLabel: 'Status',
    statusValue: 'Prüfung ausstehend',
    eligibility: 'Deine Teilnahmeberechtigung an der Verlosung wird nach Prüfung deines Nachweises bestätigt.',
    button: 'Meine Teilnahme verfolgen',
    personalNote: 'Dieser Link ist persönlich – bitte nicht weitergeben.',
    fallback: 'Falls der Button nicht funktioniert, kopiere diese Adresse:',
  },
  errors: {
    rate_limited: 'Zu viele Versuche. Bitte warte ein paar Minuten und versuche es erneut.',
    file_too_large: 'Datei zu groß. Die maximale Größe beträgt 5 MB.',
    invalid_request: 'Das Formular konnte nicht gelesen werden. Lade die Seite neu und versuche es erneut.',
    captcha: 'Die Bot-Prüfung ist fehlgeschlagen. Bitte versuche es erneut.',
    captcha_required: 'Schließe die Bot-Prüfung ab, bevor du sendest.',
    first_name: 'Gib einen gültigen Vornamen ein.',
    last_name: 'Gib einen gültigen Nachnamen ein.',
    email: 'Gib eine gültige E-Mail-Adresse ein.',
    consent: 'Setze das Häkchen, um teilzunehmen.',
    proof_required: 'Füge den Screenshot der Überweisungsbestätigung hinzu.',
    file_type: 'Format nicht akzeptiert. Verwende ein JPG-, PNG- oder WebP-Bild.',
    image_unreadable: 'Dieses Bild konnte nicht gelesen werden. Versuche einen anderen Screenshot.',
    full: 'Anmeldungen ausgebucht',
    email_taken: 'Diese E-Mail-Adresse ist bereits registriert. Pro Adresse ist nur eine Teilnahme möglich.',
    server_error: 'Die Registrierung ist fehlgeschlagen. Deine Angaben bleiben erhalten – bitte versuche es gleich noch einmal.',
    network: 'Verbindung unterbrochen. Deine Angaben bleiben erhalten – versuche es erneut, du wirst nicht doppelt registriert.',
    resend_wait: 'Bitte warte einige Sekunden, bevor du die E-Mail erneut anforderst.',
    invalid_link: 'Ungültiger Link.',
  },
};

export const lemfiCopy: Record<Locale, LemfiCopy> = { fr, en, de };

export function resolveLemfiLocale(value: unknown, fallback: Locale = 'fr'): Locale {
  return value === 'de' || value === 'en' || value === 'fr' ? value : fallback;
}

export function getLemfiCopy(locale: unknown): LemfiCopy {
  return lemfiCopy[resolveLemfiLocale(locale)];
}

export const LEMFI_DATE_LOCALE: Record<Locale, string> = { fr: 'fr-FR', en: 'en-GB', de: 'de-DE' };
