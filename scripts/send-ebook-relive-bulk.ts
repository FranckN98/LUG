import { PrismaClient } from '../src/generated/postgres-client';
import { config as loadEnv } from 'dotenv';
import { renderEmailHtml } from '../src/lib/emailTemplateRenderer';
import { FOOTER_COPY } from '../src/lib/emailCategoryTemplates';
import { SOCIAL_LINKS } from '../src/data/social';
import { DEFAULT_WHATSAPP_URL } from '../src/lib/emailFooter';
import type { SocialLinks } from '../src/types/emailTemplate';

type Locale = 'fr' | 'en' | 'de';

type Subscriber = {
  id: string;
  email: string;
  name: string | null;
};

const SITE_URL = 'https://www.levelupingermany.com';
const CONTACT_EMAIL = 'info@levelupingermany.com';
const BOOK_PDF_URL = 'https://www.levelupingermany.com/ebook.pdf';

const COPY: Record<
  Locale,
  {
    subject: (firstName: string | null) => string;
    previewText: string;
    body: (firstName: string | null) => string;
    ctaText: string;
    tagline: string;
    textVersion: (firstName: string | null, waUrl: string) => string;
  }
> = {
  fr: {
    subject: (firstName) =>
      firstName
        ? `${firstName}, revivez les moments forts de notre dernier event`
        : 'Revivez les moments forts de notre dernier event',
    previewText:
      'Le eBook Level Up in Germany est prêt: revivez les temps forts de la dernière édition.',
    body: (firstName) => `Bonjour ${firstName ?? ''},

Nous sommes heureux de vous partager à nouveau notre eBook.

<strong>Revivez les moments forts de notre dernier event</strong>: les interventions marquantes, les témoignages inspirants et les insights clés à retenir.

<p style="margin:0 0 16px;line-height:1.7">Cliquez sur le bouton ci-dessous pour ouvrir votre eBook, ou <a href="${BOOK_PDF_URL}" style="color:#1a73e8;font-weight:600;text-decoration:underline">cliquez ici</a> pour télécharger directement.</p>`,
    ctaText: 'Revivre les moments forts (PDF)',
    tagline: 'Ose être différent.',
    textVersion: (firstName, waUrl) => `Bonjour ${firstName ?? ''},

Revivez les moments forts de notre dernier event avec notre eBook:
${BOOK_PDF_URL}

Restez connecté(e):
• Site: ${SITE_URL}
• Communauté WhatsApp: ${waUrl}
• Contact: ${CONTACT_EMAIL}

À très bientôt,
L'équipe Level Up in Germany`,
  },
  en: {
    subject: (firstName) =>
      firstName
        ? `${firstName}, relive the highlights of our last event`
        : 'Relive the highlights of our last event',
    previewText:
      'Your Level Up in Germany eBook is ready: relive the top moments from the last edition.',
    body: (firstName) => `Hello ${firstName ?? ''},

We are happy to share our eBook with you again.

<strong>Relive the highlights of our last event</strong>: key talks, inspiring stories and practical takeaways.

<p style="margin:0 0 16px;line-height:1.7">Click the button below to open your eBook, or <a href="${BOOK_PDF_URL}" style="color:#1a73e8;font-weight:600;text-decoration:underline">click here</a> to download it directly.</p>`,
    ctaText: 'Relive the highlights (PDF)',
    tagline: 'Dare to be different.',
    textVersion: (firstName, waUrl) => `Hello ${firstName ?? ''},

Relive the highlights of our last event with our eBook:
${BOOK_PDF_URL}

Stay connected:
• Website: ${SITE_URL}
• WhatsApp community: ${waUrl}
• Contact: ${CONTACT_EMAIL}

See you soon,
The Level Up in Germany Team`,
  },
  de: {
    subject: (firstName) =>
      firstName
        ? `${firstName}, erleben Sie die Highlights unseres letzten Events erneut`
        : 'Erleben Sie die Highlights unseres letzten Events erneut',
    previewText:
      'Ihr Level Up in Germany eBook ist bereit: Erleben Sie die wichtigsten Momente der letzten Ausgabe erneut.',
    body: (firstName) => `Hallo ${firstName ?? ''},

wir freuen uns, unser eBook erneut mit Ihnen zu teilen.

<strong>Erleben Sie die Highlights unseres letzten Events erneut</strong>: starke Vorträge, inspirierende Erfahrungsberichte und zentrale Impulse.

<p style="margin:0 0 16px;line-height:1.7">Klicken Sie auf den Button unten, um Ihr eBook zu öffnen, oder <a href="${BOOK_PDF_URL}" style="color:#1a73e8;font-weight:600;text-decoration:underline">klicken Sie hier</a> für den direkten Download.</p>`,
    ctaText: 'Highlights erneut erleben (PDF)',
    tagline: 'Wage, anders zu sein.',
    textVersion: (firstName, waUrl) => `Hallo ${firstName ?? ''},

Erleben Sie die Highlights unseres letzten Events mit unserem eBook erneut:
${BOOK_PDF_URL}

Bleiben Sie verbunden:
• Website: ${SITE_URL}
• WhatsApp-Community: ${waUrl}
• Kontakt: ${CONTACT_EMAIL}

Bis bald,
Das Level Up in Germany Team`,
  },
};

function normalizeLocale(value: string | null | undefined): Locale {
  const v = (value ?? '').toLowerCase();
  if (v === 'en' || v === 'de' || v === 'fr') return v;
  return 'fr';
}

function safeFirstName(name: string | null | undefined): string | null {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed.length > 30 ? null : trimmed;
}

async function main() {
  loadEnv({ path: '.env', override: true });
  loadEnv({ path: '.env.local', override: true });

  if (process.env.NEON_DATABASE_URL?.trim()) {
    process.env.DATABASE_URL = process.env.NEON_DATABASE_URL.trim();
    process.env.POSTGRES_DATABASE_URL = process.env.NEON_DATABASE_URL.trim();
  }

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.NEWSLETTER_FROM_EMAIL?.trim() ||
    process.env.FORMS_FROM_EMAIL?.trim() ||
    'Level Up in Germany <onboarding@resend.dev>';

  if (!process.env.POSTGRES_DATABASE_URL?.trim()) {
    throw new Error('POSTGRES_DATABASE_URL missing');
  }
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY missing');
  }
  if (!process.env.POSTGRES_DATABASE_URL.includes('postgres')) {
    throw new Error('Refusing to run: POSTGRES_DATABASE_URL is not PostgreSQL/production');
  }

  const doSend = process.argv.includes('--send');
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const limit = limitArg ? Number(limitArg.split('=')[1]) : null;

  const prisma = new PrismaClient();
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
      orderBy: { createdAt: 'asc' },
    }) as Subscriber[];

    const recipients = limit ? subscribers.slice(0, limit) : subscribers;

    console.log(`[bulk-ebook] active subscribers found: ${subscribers.length}`);
    console.log(`[bulk-ebook] selected recipients: ${recipients.length}`);
    console.log(`[bulk-ebook] mode: ${doSend ? 'SEND' : 'DRY-RUN'}`);

    const waUrl = DEFAULT_WHATSAPP_URL;

    const social: SocialLinks = {
      website: SITE_URL,
      linkedin: SOCIAL_LINKS.linkedin,
      instagram: SOCIAL_LINKS.instagram,
      tiktok: SOCIAL_LINKS.tiktok,
      youtube: '',
      whatsapp: waUrl,
      email: CONTACT_EMAIL,
    };

    let sent = 0;
    let failed = 0;

    for (const sub of recipients) {
      const locale = normalizeLocale('fr');
      const firstName = safeFirstName(sub.name);
      const copy = COPY[locale];
      const footer = FOOTER_COPY[locale];
      const subject = copy.subject(firstName);

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

      const htmlWithPreview = html.replace(
        /<body([^>]*)>/i,
        (match) =>
          `${match}<span style="display:none !important;opacity:0;visibility:hidden;max-height:0;max-width:0;overflow:hidden;color:transparent">${copy.previewText}</span>`,
      );

      const text = copy.textVersion(firstName, waUrl);

      if (!doSend) {
        console.log(`[dry-run] ${sub.email} | locale=${locale}`);
        continue;
      }

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from,
            to: [sub.email],
            subject,
            text,
            html: htmlWithPreview,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          failed++;
          console.error(`[fail] ${sub.email} | ${res.status} ${err}`);
        } else {
          sent++;
          if (sent % 25 === 0) console.log(`[progress] sent=${sent} failed=${failed}`);
        }
      } catch (err) {
        failed++;
        console.error(`[fail] ${sub.email} | ${String(err)}`);
      }
    }

    console.log(`[done] sent=${sent} failed=${failed} total=${recipients.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[bulk-ebook] fatal:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
