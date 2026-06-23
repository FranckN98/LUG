/**
 * Transactional confirmation e-mail sent after someone signs up to download
 * the Level Up in Germany event book (1ère édition / 2025).
 *
 * Uses the shared branded template (`renderEmailHtml`) so the e-mail matches
 * the rest of the site: gradient hero with the logo, accent CTA button,
 * social footer, signature. Localised to the visitor's detected language
 * (fr / en / de) with personalised greeting when a first name is known.
 */

import type { SocialLinks } from '@/types/emailTemplate';
import { renderEmailHtml } from '@/lib/emailTemplateRenderer';
import { FOOTER_COPY } from '@/lib/emailCategoryTemplates';
import { SOCIAL_LINKS } from '@/data/social';
import { getLinktreeWhatsAppUrl } from '@/lib/linktreeWhatsApp';

type Locale = 'fr' | 'en' | 'de';

interface LocalisedCopy {
  subject: (firstName: string | null, edition: string) => string;
  previewText: string;
  body: (firstName: string | null) => string;
  ctaText: string;
  tagline: string;
  textVersion: (params: { firstName: string | null; pdfUrl: string; waUrl: string }) => string;
}

const SITE_URL = 'https://www.levelupingermany.com';
const CONTACT_EMAIL = 'info@levelupingermany.com';

/** Canonical public download link for the 1st-edition book (kept verbatim). */
const BOOK_PDF_URL = 'https://www.levelupingermany.com/pdf/book';

/** Inline "click here" anchor in brand blue, shown inside the email body. */
const inlineDownloadLink = (label: string) =>
  `<a href="${BOOK_PDF_URL}" style="color:#1a73e8;font-weight:600;text-decoration:underline">${label}</a>`;

function safeFirstName(name?: string | null): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed.length > 30 ? null : trimmed;
}

const COPY: Record<Locale, LocalisedCopy> = {
  fr: {
    subject: (firstName, edition) =>
      firstName
        ? `Merci ${firstName} — votre livre Level Up ${edition} est prêt à télécharger`
        : `Merci pour votre intérêt — votre livre Level Up ${edition} est prêt`,
    previewText:
      "Téléchargez le livre de la 1ère édition de Level Up in Germany — rétrospective, temps forts et inspirations.",
    body: (firstName) => `Bonjour ${firstName ?? ''},

Merci infiniment pour votre intérêt pour <strong>Level Up in Germany</strong>. Votre demande a bien été reçue et le livre de notre 1ère édition est prêt à être téléchargé.

À l'intérieur, vous retrouverez :
<ul style="margin:8px 0 18px;padding-left:22px;line-height:1.7">
  <li>les <strong>temps forts</strong> de l'événement,</li>
  <li>les <strong>témoignages</strong> et retours d'expérience des intervenants,</li>
  <li>des <strong>insights pratiques</strong> pour faire avancer votre parcours en Allemagne,</li>
  <li>et un aperçu de ce qui vous attend lors de la <strong>prochaine édition</strong>.</li>
</ul>

Cliquez sur le bouton ci-dessous pour ouvrir et télécharger votre exemplaire :

<p style="margin:0 0 16px;line-height:1.7">Ou ${inlineDownloadLink('cliquez ici pour télécharger')} directement.</p>`,
    ctaText: 'Télécharger le livre (PDF)',
    tagline: 'Ose être différent.',
    textVersion: ({ firstName, pdfUrl, waUrl }) => `Bonjour ${firstName ?? ''},

Merci pour votre intérêt pour Level Up in Germany. Votre livre de la 1ère édition est prêt à être téléchargé :

${pdfUrl}

À l'intérieur : les temps forts de l'événement, les témoignages, des insights pratiques et un aperçu de la prochaine édition.

Restez connecté(e) :
• Site : ${SITE_URL}
• Communauté WhatsApp : ${waUrl}
• Contact : ${CONTACT_EMAIL}

À très bientôt,
L'équipe Level Up in Germany`,
  },

  en: {
    subject: (firstName, edition) =>
      firstName
        ? `Thank you ${firstName} — your Level Up ${edition} book is ready to download`
        : `Thank you for your interest — your Level Up ${edition} book is ready`,
    previewText:
      'Download the book from the 1st edition of Level Up in Germany — recap, highlights and takeaways.',
    body: (firstName) => `Hello ${firstName ?? ''},

Thank you so much for your interest in <strong>Level Up in Germany</strong>. Your request has been received and the book from our 1st edition is ready to download.

Inside, you will find:
<ul style="margin:8px 0 18px;padding-left:22px;line-height:1.7">
  <li>the <strong>highlights</strong> of the event,</li>
  <li>real <strong>stories and testimonials</strong> from our speakers and guests,</li>
  <li><strong>practical insights</strong> to help you move forward in Germany,</li>
  <li>and a preview of what is coming for the <strong>next edition</strong>.</li>
</ul>

Click the button below to open and download your copy:

<p style="margin:0 0 16px;line-height:1.7">Or ${inlineDownloadLink('click here to download')} directly.</p>`,
    ctaText: 'Download the book (PDF)',
    tagline: 'Dare to be different.',
    textVersion: ({ firstName, pdfUrl, waUrl }) => `Hello ${firstName ?? ''},

Thank you for your interest in Level Up in Germany. Your 1st edition book is ready to download:

${pdfUrl}

Inside: event highlights, speaker stories, practical insights and a preview of the next edition.

Stay connected:
• Website: ${SITE_URL}
• WhatsApp community: ${waUrl}
• Contact: ${CONTACT_EMAIL}

See you soon,
The Level Up in Germany Team`,
  },

  de: {
    subject: (firstName, edition) =>
      firstName
        ? `Vielen Dank ${firstName} — Ihr Level Up ${edition} Buch steht bereit`
        : `Vielen Dank für Ihr Interesse — Ihr Level Up ${edition} Buch ist bereit`,
    previewText:
      'Laden Sie das Buch zur 1. Ausgabe von Level Up in Germany herunter — Rückblick, Highlights und Impulse.',
    body: (firstName) => `Hallo ${firstName ?? ''},

vielen Dank für Ihr Interesse an <strong>Level Up in Germany</strong>. Ihre Anfrage ist bei uns angekommen und das Buch zu unserer 1. Ausgabe steht für Sie zum Download bereit.

Das erwartet Sie darin:
<ul style="margin:8px 0 18px;padding-left:22px;line-height:1.7">
  <li>die <strong>Highlights</strong> der Veranstaltung,</li>
  <li><strong>Erfahrungsberichte</strong> unserer Speaker und Gäste,</li>
  <li><strong>praktische Impulse</strong> für Ihren Weg in Deutschland,</li>
  <li>und ein Ausblick auf die <strong>nächste Ausgabe</strong>.</li>
</ul>

Klicken Sie auf den Button unten, um Ihr Exemplar zu öffnen und herunterzuladen:

<p style="margin:0 0 16px;line-height:1.7">Oder ${inlineDownloadLink('hier herunterladen')} klicken.</p>`,
    ctaText: 'Buch herunterladen (PDF)',
    tagline: 'Wage, anders zu sein.',
    textVersion: ({ firstName, pdfUrl, waUrl }) => `Hallo ${firstName ?? ''},

vielen Dank für Ihr Interesse an Level Up in Germany. Ihr Buch zur 1. Ausgabe steht zum Download bereit:

${pdfUrl}

Inhalte: Highlights der Veranstaltung, Erfahrungsberichte, praktische Impulse und ein Ausblick auf die nächste Ausgabe.

Bleiben Sie verbunden:
• Website: ${SITE_URL}
• WhatsApp-Community: ${waUrl}
• Kontakt: ${CONTACT_EMAIL}

Bis bald,
Das Level Up in Germany Team`,
  },
};

export interface NewsletterPdfEmailParams {
  toEmail: string;
  pdfAbsoluteUrl: string;
  locale?: Locale;
  firstName?: string | null;
  /** Event edition string used in the subject line (e.g. "2025"). Defaults to "2025". */
  edition?: string;
}

/**
 * Collapse an accidentally self-doubled URL (e.g. "https://x/a.pdfhttps://x/a.pdf")
 * back to a single canonical URL. Defensive: keeps the email link valid even if an
 * upstream caller concatenates the path twice.
 */
function normalisePdfUrl(raw: string): string {
  const url = (raw || '').trim();
  if (!url) return url;
  const half = url.length / 2;
  if (Number.isInteger(half)) {
    const first = url.slice(0, half);
    const second = url.slice(half);
    if (first === second && /^https?:\/\//i.test(first)) return first;
  }
  // Generic case: two absolute URLs concatenated → keep the first.
  const dupe = url.match(/^(https?:\/\/.+?)(https?:\/\/.+)$/i);
  if (dupe && dupe[1] === dupe[2]) return dupe[1];
  return url;
}

/**
 * Sends the localised, branded "your book is ready" e-mail via Resend.
 *
 * Throws:
 *  - `email_not_configured` when `RESEND_API_KEY` is missing,
 *  - `resend_failed: <status> <body>` when the Resend API rejects the request.
 */
export async function sendNewsletterPdfEmail(
  params: NewsletterPdfEmailParams,
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    process.env.FORMS_FROM_EMAIL?.trim() ||
    'Level Up in Germany <onboarding@resend.dev>';

  if (!apiKey) {
    // eslint-disable-next-line no-console
    console.warn('[subscribe] RESEND_API_KEY manquant — e-mail non envoyé vers', params.toEmail);
    throw new Error('email_not_configured');
  }

  const locale: Locale = params.locale ?? 'fr';
  const edition = (params.edition ?? '2025').trim() || '2025';
  const firstName = safeFirstName(params.firstName);
  const copy = COPY[locale];

  const waUrl = await getLinktreeWhatsAppUrl();

  const social: SocialLinks = {
    website: SITE_URL,
    linkedin: SOCIAL_LINKS.linkedin,
    instagram: SOCIAL_LINKS.instagram,
    tiktok: SOCIAL_LINKS.tiktok,
    youtube: '',
    whatsapp: waUrl,
    email: CONTACT_EMAIL,
  };

  const subject = copy.subject(firstName, edition);
  const footer = FOOTER_COPY[locale];

  const html = renderEmailHtml({
    template: {
      subject,
      body: copy.body(firstName),
      ctaText: copy.ctaText,
      ctaLink: BOOK_PDF_URL,
      headerImageUrl: `${SITE_URL}/logo.png`,
      footerContact: `Level Up in Germany · ${CONTACT_EMAIL}`,
      language: locale,
      signature: footer.signature,
      tagline: copy.tagline,
    },
    social,
    siteBaseUrl: SITE_URL,
    language: locale,
  });

  // Hidden inbox-preview snippet — shown by Gmail/Outlook in the message list.
  const htmlWithPreview = html.replace(
    /<body([^>]*)>/i,
    (match) =>
      `${match}<span style="display:none !important;opacity:0;visibility:hidden;max-height:0;max-width:0;overflow:hidden;color:transparent">${copy.previewText}</span>`,
  );

  const text = copy.textVersion({ firstName, pdfUrl: BOOK_PDF_URL, waUrl });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [params.toEmail],
      subject,
      text,
      html: htmlWithPreview,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    // eslint-disable-next-line no-console
    console.error(
      '[subscribe] Resend refusé:',
      res.status,
      errText,
      '| from:',
      from,
      '| to:',
      params.toEmail,
    );
    throw new Error(`resend_failed: ${res.status} ${errText}`);
  }
}
